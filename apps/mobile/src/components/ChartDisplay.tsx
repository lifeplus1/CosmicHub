import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { AstrologyChart, Planet } from '@cosmichub/types';

interface Props {
  chartData: AstrologyChart;
  width?: number;
  height?: number;
  title?: string;
}

export function ChartDisplay({ chartData, width = 300, height = 300, title = 'Birth Chart' }: Props) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.4;

  // This is a simplified version - you'd migrate your existing D3 logic here
  const renderPlanets = () => {
    if (chartData?.planets === null || chartData?.planets === undefined) return null;

    return chartData.planets.map((planet: Planet, index: number) => {
      const angle = (planet.position * Math.PI) / 180;
      const x = centerX + radius * 0.8 * Math.cos(angle - Math.PI / 2);
      const y = centerY + radius * 0.8 * Math.sin(angle - Math.PI / 2);

      return (
        <G key={planet.name + index}>
          <Circle cx={x} cy={y} r="4" fill="#fff" />
          <SvgText
            x={x}
            y={y - 10}
            fontSize="10"
            fill="#ccc"
            textAnchor="middle"
          >
            {planet.name.substring(0, 2).toUpperCase()}
          </SvgText>
        </G>
      );
    });
  };

  const renderHouses = () => {
    const houses = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const x1 = centerX + radius * Math.cos(angle - Math.PI / 2);
      const y1 = centerY + radius * Math.sin(angle - Math.PI / 2);
      const x2 = centerX + radius * 1.1 * Math.cos(angle - Math.PI / 2);
      const y2 = centerY + radius * 1.1 * Math.sin(angle - Math.PI / 2);

      houses.push(
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#4a4a6a"
          strokeWidth="1"
        />
      );
    }
    return houses;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={width} height={height} style={styles.chart}>
        {/* Outer circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#4a4a6a"
          strokeWidth="2"
        />
        
        {/* House divisions */}
        {renderHouses()}
        
        {/* Planets */}
        {renderPlanets()}
      </Svg>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>
          {chartData?.planets !== null && chartData?.planets !== undefined ? chartData.planets.length : 0} planets • {chartData?.houses !== null && chartData?.houses !== undefined ? chartData.houses.length : 0} houses
        </Text>
        <Text style={styles.infoText}>
          {chartData?.aspects !== null && chartData?.aspects !== undefined ? chartData.aspects.length : 0} aspects
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chart: {
    marginBottom: 15,
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
});
