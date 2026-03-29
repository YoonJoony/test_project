import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
	...nextCoreWebVitals,
	...nextTypeScript,
	prettierRecommended,
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'prettier/prettier': ['error', { endOfLine: 'auto' }],
		},
	},
];

export default eslintConfig;
