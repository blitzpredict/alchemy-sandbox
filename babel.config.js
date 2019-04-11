const plugins = [
    [
        "@babel/plugin-proposal-class-properties",
        {
            loose: true
        }
    ],
    [
        "@babel/plugin-proposal-object-rest-spread",
        {
            useBuiltIns: true
        }
    ]
];


module.exports = function getConfig(api) {
    api.cache(true);

    const presets = [];

    presets.push([
        "@babel/preset-env", {
            targets: {
                node: "10.15"
            }
        }
    ]);

    return {
        presets,
        plugins
    };
};
