/**
 * Component Library Analysis Demo
 */

import { createComponentLibraryOptimizer } from './componentLibrary';
/* eslint-disable no-console */
const devConsole = {
  log: import.meta.env.DEV ? console.log.bind(console) : undefined,
  warn: import.meta.env.DEV ? console.warn.bind(console) : undefined,
  error: console.error.bind(console)
};
/* eslint-enable no-console */

const optimizer = createComponentLibraryOptimizer();

// Sample component with issues
const dropdownCode = `const Dropdown = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (optionValue) => {
    setIsOpen(false);
  };

  return (
    <div>
      <button aria-expanded={isOpen ? 'true' : 'false'}>
        Select
      </button>
      {isOpen && (
        <ul role="listbox">
          {options.map(option => (
            <li onClick={() => handleOptionClick(option)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};`;

const buttonCode = `const Button = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick}
      style={{ color: '#ff0000', padding: '10px' }}
    >
      {children}
    </button>
  );
};`;

devConsole.log?.('🔍 Analyzing Components...\n');

// Analyze dropdown
const dropdownIssues = optimizer.analyzeComponent(dropdownCode, 'Dropdown');
devConsole.log?.(`📊 Dropdown: Found ${dropdownIssues.length} issues`);
dropdownIssues.forEach(issue => {
  const emoji = { critical: '🚨', high: '⚠️', medium: '📝', low: '💡' }[issue.severity];
  devConsole.log?.(`  ${emoji} ${issue.message}`);
});

// Analyze button  
const buttonIssues = optimizer.analyzeComponent(buttonCode, 'Button');
devConsole.log?.(`\n� Button: Found ${buttonIssues.length} issues`);
buttonIssues.forEach(issue => {
  const emoji = { critical: '🚨', high: '⚠️', medium: '📝', low: '�' }[issue.severity];
  devConsole.log?.(`  ${emoji} ${issue.message}`);
});

// Auto-fix
devConsole.log?.('\n🔧 Auto-fixing Dropdown...');
const fixedDropdown = optimizer.autoFixComponent(dropdownCode, 'Dropdown');
if (fixedDropdown !== dropdownCode) {
  devConsole.log?.('✅ Fixed undefined function reference');
} else {
  devConsole.log?.('ℹ️ No auto-fixes applied');
}

// Generate report
const report = optimizer.generateReport([
  { name: 'Dropdown', code: dropdownCode },
  { name: 'Button', code: buttonCode }
]);

devConsole.log?.('\n📋 Library Report');
devConsole.log?.('================');
devConsole.log?.(`Components: ${report.totalComponents}`);
devConsole.log?.(`Issues: ${report.issuesFound.length}`);
devConsole.log?.(`Health: ${report.overallHealth}%`);
devConsole.log?.(`Design Compliance: ${report.designSystemCompliance.toFixed(1)}%`);

devConsole.log?.('\n🎯 Recommendations:');
report.recommendations.forEach((rec, i) => {
  devConsole.log?.(`  ${i + 1}. ${rec}`);
});

devConsole.log?.('\n✨ Analysis Complete!');
