  module.exports = {
     presets: [
       ["@babel/preset-env", { targets: { node: "current" } }],
       ["@babel/preset-react", { runtime: "automatic" }],
     ],
     plugins: [
       ["@babel/plugin-transform-runtime"],
       ["transform-import-meta", { module: true }],
     ],
   };