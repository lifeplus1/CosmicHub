/**
 * Component Library Analysis Demo
 */

import { createComponentLibraryOptimizer } from './componentLibrary';

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

console.log('🔍 Analyzing Components...\n');

// Analyze dropdown
const dropdownIssues = optimizer.analyzeComponent(dropdownCode, 'Dropdown');
console.log(`📊 Dropdown: Found ${dropdownIssues.length} issues`);
dropdownIssues.forEach(issue => {
  const emoji = { critical: '🚨', high: '⚠️', medium: '📝', low: '💡' }[issue.severity];
  console.log(`  ${emoji} ${issue.message}`);
});

// Analyze button  
const buttonIssues = optimizer.analyzeComponent(buttonCode, 'Button');
console.log(`\n� Button: Found ${buttonIssues.length} issues`);
buttonIssues.forEach(issue => {
  const emoji = { critical: '🚨', high: '⚠️', medium: '📝', low: '�' }[issue.severity];
  console.log(`  ${emoji} ${issue.message}`);
});

// Auto-fix
console.log('\n🔧 Auto-fixing Dropdown...');
const fixedDropdown = optimizer.autoFixComponent(dropdownCode, 'Dropdown');
if (fixedDropdown !== dropdownCode) {
  console.log('✅ Fixed undefined function reference');
} else {
  console.log('ℹ️ No auto-fixes applied');
}

// Generate report
const report = optimizer.generateReport([
  { name: 'Dropdown', code: dropdownCode },
  { name: 'Button', code: buttonCode }
]);

console.log('\n📋 Library Report');
console.log('================');
console.log(`Components: ${report.totalComponents}`);
console.log(`Issues: ${report.issuesFound.length}`);
console.log(`Health: ${report.overallHealth}%`);
console.log(`Design Compliance: ${report.designSystemCompliance.toFixed(1)}%`);

console.log('\n🎯 Recommendations:');
report.recommendations.forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec}`);
});

console.log('\n✨ Analysis Complete!');
