"""
Adaptive Concurrency Controller - PERF-001 Implementation

Implements intelligent concurrency limits for calculation endpoints
with automatic backpressure and queue management.
"""

import asyncio
import time
from collections import deque
from dataclasses import dataclass
from typing import Dict, Optional, Any, Callable, Awaitable, Union
from functools import wraps
import logging

logger = logging.getLogger(__name__)


@dataclass
class ConcurrencyMetrics:
    """Metrics for tracking concurrency performance."""
    
    active_requests: int = 0
    completed_requests: int = 0
    failed_requests: int = 0
    queue_size: int = 0
    average_latency: float = 0.0
    success_rate: float = 100.0
    last_updated: float = 0.0


@dataclass  
class ConcurrencyConfig:
    """Configuration for adaptive concurrency control."""
    
    initial_limit: int = 10
    min_limit: int = 2
    max_limit: int = 50
    queue_timeout: float = 30.0
    backpressure_threshold: float = 0.8  # Trigger backpressure at 80% capacity
    success_rate_threshold: float = 95.0  # Maintain 95% success rate
    latency_threshold_ms: float = 2000.0  # Target <2s response time
    adjustment_interval: float = 10.0  # Adjust limits every 10 seconds


class AdaptiveConcurrencyController:
    """
    Intelligent concurrency controller that automatically adjusts limits
    based on system performance metrics.
    """
    
    def __init__(self, config: Optional[ConcurrencyConfig] = None):
        self.config = config or ConcurrencyConfig()
        self.current_limit = self.config.initial_limit
        self.semaphore = asyncio.Semaphore(self.current_limit)
        
        # Metrics tracking
        self.metrics = ConcurrencyMetrics()
        self.latency_history: deque[float] = deque(maxlen=100)
        self.success_history: deque[bool] = deque(maxlen=100)
        
        # Request queue for backpressure handling
        self.request_queue: asyncio.Queue[tuple[Callable[..., Awaitable[Any]], tuple[Any, ...], dict[str, Any], float]] = asyncio.Queue()
        self.queue_processors: list[asyncio.Task[None]] = []
        
        # Adjustment tracking
        self.last_adjustment = time.time()
        self.adjustment_history: deque[dict[str, Any]] = deque(maxlen=50)
        
        # Start background adjustment task
        self.adjustment_task = None
        self.running = False

    async def start(self):
        """Start the concurrency controller."""
        if self.running:
            return
            
        self.running = True
        self.adjustment_task = asyncio.create_task(self._adjustment_loop())
        logger.info(f"Adaptive concurrency controller started with limit {self.current_limit}")

    async def stop(self):
        """Stop the concurrency controller."""
        self.running = False
        
        if self.adjustment_task:
            self.adjustment_task.cancel()
            try:
                await self.adjustment_task
            except asyncio.CancelledError:
                pass
                
        # Stop queue processors
        for processor in self.queue_processors:
            processor.cancel()
        
        self.queue_processors.clear()
        logger.info("Adaptive concurrency controller stopped")

    async def execute_with_concurrency_control(
        self,
        func: Callable[..., Awaitable[Any]],
        *args: Any,
        **kwargs: Any
    ) -> Any:
        """
        Execute a function with adaptive concurrency control.
        
        Args:
            func: Async function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Function result
            
        Raises:
            asyncio.TimeoutError: If request times out in queue
            Exception: Any exception raised by the function
        """
        start_time = time.time()
        
        try:
            # Check if we should apply backpressure
            if self._should_apply_backpressure():
                logger.warning("Applying backpressure - queueing request")
                await self._queue_request(func, args, kwargs, start_time)
                return
            
            # Acquire semaphore for concurrency control
            async with self.semaphore:
                self.metrics.active_requests += 1
                
                try:
                    result = await func(*args, **kwargs)
                    await self._record_success(start_time)
                    return result
                    
                except Exception as e:
                    await self._record_failure(start_time, e)
                    raise
                    
                finally:
                    self.metrics.active_requests -= 1
                    
        except asyncio.TimeoutError:
            await self._record_timeout(start_time)
            raise
        except Exception as e:
            logger.error(f"Unexpected error in concurrency control: {e}")
            raise

    def _should_apply_backpressure(self) -> bool:
        """Determine if backpressure should be applied."""
        utilization = self.metrics.active_requests / self.current_limit
        return (
            utilization >= self.config.backpressure_threshold or
            self.metrics.queue_size > self.current_limit * 2 or
            self.metrics.success_rate < self.config.success_rate_threshold
        )

    async def _queue_request(
        self,
        func: Callable[..., Awaitable[Any]],
        args: tuple[Any, ...],
        kwargs: dict[str, Any],
        start_time: float
    ) -> Any:
        """Queue a request for later processing."""
        try:
            await asyncio.wait_for(
                self.request_queue.put((func, args, kwargs, start_time)),
                timeout=self.config.queue_timeout
            )
            self.metrics.queue_size += 1
            
        except asyncio.TimeoutError:
            logger.error("Request queue timeout - dropping request")
            raise

    async def _record_success(self, start_time: float):
        """Record successful request completion."""
        latency = (time.time() - start_time) * 1000  # Convert to ms
        
        self.metrics.completed_requests += 1
        self.latency_history.append(latency)
        self.success_history.append(True)
        
        # Update rolling averages
        self._update_metrics()

    async def _record_failure(self, start_time: float, error: Exception):
        """Record failed request."""
        latency = (time.time() - start_time) * 1000
        
        self.metrics.failed_requests += 1
        self.latency_history.append(latency)
        self.success_history.append(False)
        
        logger.warning(f"Request failed after {latency:.1f}ms: {error}")
        self._update_metrics()

    async def _record_timeout(self, start_time: float):
        """Record request timeout."""
        latency = (time.time() - start_time) * 1000
        
        self.metrics.failed_requests += 1
        self.latency_history.append(latency)
        self.success_history.append(False)
        
        logger.warning(f"Request timed out after {latency:.1f}ms")
        self._update_metrics()

    def _update_metrics(self):
        """Update rolling performance metrics."""
        if self.latency_history:
            self.metrics.average_latency = sum(self.latency_history) / len(self.latency_history)
        
        if self.success_history:
            success_count = sum(1 for success in self.success_history if success)
            self.metrics.success_rate = (success_count / len(self.success_history)) * 100
        
        self.metrics.last_updated = time.time()

    async def _adjustment_loop(self):
        """Background task that adjusts concurrency limits based on performance."""
        while self.running:
            try:
                await asyncio.sleep(self.config.adjustment_interval)
                await self._adjust_concurrency_limit()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in adjustment loop: {e}")

    async def _adjust_concurrency_limit(self):
        """Adjust concurrency limit based on current performance metrics."""
        old_limit = self.current_limit
        new_limit = self._calculate_optimal_limit()
        
        if new_limit != old_limit:
            await self._apply_limit_change(new_limit)
            
            self.adjustment_history.append({
                'timestamp': time.time(),
                'old_limit': old_limit,
                'new_limit': new_limit,
                'success_rate': self.metrics.success_rate,
                'average_latency': self.metrics.average_latency,
                'active_requests': self.metrics.active_requests
            })
            
            logger.info(
                f"Adjusted concurrency limit: {old_limit} → {new_limit} "
                f"(Success: {self.metrics.success_rate:.1f}%, "
                f"Latency: {self.metrics.average_latency:.1f}ms)"
            )

    def _calculate_optimal_limit(self) -> int:
        """Calculate optimal concurrency limit based on current metrics."""
        current = self.current_limit
        
        # If performance is good, consider increasing
        if (self.metrics.success_rate >= self.config.success_rate_threshold and
            self.metrics.average_latency < self.config.latency_threshold_ms and
            self.metrics.active_requests >= current * 0.8):  # High utilization
            
            # Gradual increase
            return min(current + max(1, current // 10), self.config.max_limit)
        
        # If performance is poor, decrease
        elif (self.metrics.success_rate < self.config.success_rate_threshold or
              self.metrics.average_latency > self.config.latency_threshold_ms):
            
            # More aggressive decrease for poor performance
            decrease = max(1, current // 5)
            return max(current - decrease, self.config.min_limit)
        
        # Performance is acceptable, maintain current limit
        return current

    async def _apply_limit_change(self, new_limit: int):
        """Apply a new concurrency limit."""
        old_limit = self.current_limit
        self.current_limit = new_limit
        
        # Create new semaphore with updated limit
        self.semaphore = asyncio.Semaphore(new_limit)
        
        # If decreasing limit, log the change but let requests complete naturally
        if new_limit < old_limit:
            logger.info(f"Concurrency limit decreased from {old_limit} to {new_limit}")
            # Note: Active requests will complete naturally, new requests will use new limit

    def get_metrics(self) -> ConcurrencyMetrics:
        """Get current performance metrics."""
        self.metrics.queue_size = self.request_queue.qsize()
        return self.metrics

    def get_status_summary(self) -> Dict[str, Any]:
        """Get comprehensive status summary."""
        metrics = self.get_metrics()
        
        return {
            'current_limit': self.current_limit,
            'utilization_percent': (metrics.active_requests / self.current_limit) * 100,
            'metrics': {
                'active_requests': metrics.active_requests,
                'completed_requests': metrics.completed_requests,
                'failed_requests': metrics.failed_requests,
                'queue_size': metrics.queue_size,
                'average_latency_ms': round(metrics.average_latency, 1),
                'success_rate_percent': round(metrics.success_rate, 1)
            },
            'recent_adjustments': list(self.adjustment_history)[-5:],  # Last 5 adjustments
            'config': {
                'min_limit': self.config.min_limit,
                'max_limit': self.config.max_limit,
                'backpressure_threshold': self.config.backpressure_threshold,
                'success_rate_threshold': self.config.success_rate_threshold,
                'latency_threshold_ms': self.config.latency_threshold_ms
            }
        }


# Global controller instance for application-wide use
_global_controller: Optional[AdaptiveConcurrencyController] = None


async def get_concurrency_controller() -> AdaptiveConcurrencyController:
    """Get or create the global concurrency controller."""
    global _global_controller
    
    if _global_controller is None:
        _global_controller = AdaptiveConcurrencyController()
        await _global_controller.start()
    
    return _global_controller


def with_concurrency_control(
    func: Optional[Callable[..., Awaitable[Any]]] = None
) -> Union[Callable[..., Awaitable[Any]], Callable[[Callable[..., Awaitable[Any]]], Callable[..., Awaitable[Any]]]]:
    """
    Decorator to add adaptive concurrency control to async functions.
    
    Usage:
        @with_concurrency_control
        async def my_calculation_function(data):
            # Expensive calculation here
            return result
    """
    def decorator(f: Callable[..., Awaitable[Any]]) -> Callable[..., Awaitable[Any]]:
        @wraps(f)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            controller = await get_concurrency_controller()
            return await controller.execute_with_concurrency_control(f, *args, **kwargs)
        
        return wrapper
    
    if func is not None:
        return decorator(func)
    return decorator
