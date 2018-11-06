import clear from 'rollup-plugin-clear'
import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2'

export default {
    input: 'src/index.ts',
    output: [{
        file: pkg.main,
        sourcemap: true,
        name: 'Rete',
        format: 'umd'
    }],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
        clear({
            targets: ['build']
        }),
        typescript({
            typescript: require('typescript'),
            clean: true
        })
    ]
}