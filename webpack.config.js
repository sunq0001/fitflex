var path = require('path');

module.exports = {
    entry: './src/index.js',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'fitflex.mini.js',
        libraryTarget:'umd',
        library: 'fit'
        
    },

    module:{
        rules:[
            {
                test: /\.js/,
                include: path.resolve(__dirname, "src"),
                exclude: /(node_modules|bower_components)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins:['@babel/transform-runtime']
                        
                    }
                }],
                
            }
        ]
    }
}