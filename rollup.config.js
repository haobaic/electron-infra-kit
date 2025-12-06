const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const { dts } = require('rollup-plugin-dts');
const pkg = require('./package.json');

module.exports = [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/index.mjs',
                format: 'es',
                sourcemap: true,
            },
        ],
        // 排除依赖，不打包进库中
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
            'electron',
            'path',
            'events'
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' }),
        ],
    },
    {
        // 生成类型定义文件
        input: 'src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [
            dts({
                compilerOptions: {
                    baseUrl: "./",
                    paths: {
                        "@/*": ["src/*"]
                    }
                }
            })
        ],
    },
];
