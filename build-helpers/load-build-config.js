// Important: this is duplicate code from 2sxc-ui -> load-build-config.js
const path = require('path');
const fs = require('fs-extra');
const jsoncParser = require('jsonc-parser');
const chalk = require('chalk');

/// <summary>
/// Find the 2sxc-build.config.json file in the current directory or any parent directory.
/// If it doesn't exist, find the 2sxc-build-fallback.config.json file.
/// </summary>
/// <returns>The 2sxc-build.config.json object</returns>
const getBuildConfig = () => {
    var buildConfigPath = findUp('2sxc-build.config.json') ?? findUp('2sxc-build-fallback.config.json');
    console.log(chalk.bgMagenta('------------------------------------------------------------------------------'));
    console.log(chalk.magenta(`${buildConfigPath}`));
    console.log(chalk.bgMagenta('------------------------------------------------------------------------------'));
    if (!buildConfigPath) 
      throw 'Could not find 2sxc-build.config.json or 2sxc-build-fallback.config.json file.';
    const text = fs.readFileSync(buildConfigPath).toString();
    const errors = [];
    const jsonObject = jsoncParser.parse(text, errors, { disallowComments: false, allowTrailingComma: true, allowEmptyContent: true });
    if (errors.length > 0) console.log(errors);
    return jsonObject;
};

/// <summary>
/// Find a file in the current directory or any parent directory
/// </summary>
/// <param name="filename">The name of the file to find</param>
/// <returns>The full path to the file or null if not found</returns>
const findUp = (filename) => {
    let currentDir = process.cwd();
    while (currentDir && currentDir !== path.parse(currentDir).root) {
        const potentialPath = path.join(currentDir, filename);
        if (fs.existsSync(potentialPath)) return potentialPath;
        currentDir = path.dirname(currentDir);
    }
    return null;
};

/// <summary>
/// Fix all targets, by adding the path to the target
/// </summary>
/// <param name="arrayOrValue">The target path or an array of target paths</param>
/// <param name="path">The path to add to the target</param>
/// <returns>The fixed target path or an array of fixed target paths</returns>
const fixAllTargets = (arrayOrValue, path) => {
    if (Array.isArray(arrayOrValue))
        return arrayOrValue.map(t => fixSingleTarget(t, path));
    return fixSingleTarget(arrayOrValue, path);
};

/// <summary>
/// Fix the target path by adding the path to the target
/// </summary>
/// <param name="value">The target path</param>
/// <param name="path">The path to add to the target</param>
/// <returns>The fixed target path</returns>
const fixSingleTarget = (value, addToPath) => {
    if (!value) return value;
    if (!addToPath) return fixPath(value, false, true);
    return path.resolve(fixPath(value, false, true), fixPath(addToPath, false, true));
};

/// <summary>
/// Fix the path by replacing backslashes with forwardslashes and removing double slashes
/// </summary>
/// <param name="path">The path to fix</param>
/// <param name="removeStartingSlash">Remove the starting slash</param>
/// <param name="removeEndingSlash">Remove the ending slash</param>
/// <returns>The fixed path</returns>
const fixPath = (rawPath, removeStartingSlash = false, removeEndingSlash = false) => {
    if (!rawPath) return rawPath;

    let clean = rawPath
        .trim()
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/');

    if (removeStartingSlash && clean.startsWith('/')) clean = clean.substring(1);
    if (removeEndingSlash && clean.endsWith('/')) clean = clean.substring(0, clean.length - 1);

    return clean;
};

/// <summary>
/// Get the first value from an array or return the value if it's not an array
/// </summary>
/// <param name="arrayOrValue">The array or value to get the value from</param>
/// <param name="messageIfMissing">The message to throw if the array or value is null or empty</param>
/// <returns>The first value from the array or the value if it's not an array</returns>
const getFirstItem = (arrayOrValue, messageIfMissing) => {
    if (!arrayOrValue)
        if (messageIfMissing)
            {
               console.log(chalk.red(messageIfMissing));
               console.log(chalk.bgMagenta('------------------------------------------------------------------------------'));
               return null;
            }
    return Array.isArray(arrayOrValue) ? (arrayOrValue.length > 0 ? arrayOrValue[0] : null) : arrayOrValue;
};


const BuildConfig = getBuildConfig();

console.log(chalk.magenta('BuildConfig targets:\n')
  + chalk.bold('JsTargets:\n')
  + chalk.magenta(BuildConfig.JsTargets?.join('\n'))
  + chalk.bold('\nSources:\n')
  + chalk.magenta(BuildConfig.Sources?.join('\n'))
);
console.log(chalk.bgMagenta('------------------------------------------------------------------------------'));

BuildConfig.Sources = fixAllTargets(BuildConfig.Sources, '');
BuildConfig.source = getFirstItem(BuildConfig.Sources, "Problem: 'Sources' array doesn't exist in 2sxc-build.config.json. It should point to the assets source folder in your 2sxc environment");
BuildConfig.hasSource = BuildConfig.source != null;
BuildConfig.JsTargets = fixAllTargets(BuildConfig.JsTargets, '');
BuildConfig.jsTarget = getFirstItem(BuildConfig.JsTargets, "Problem: 'JsTargets' array doesn't exist in 2sxc-build.config.json.");


module.exports = {
    fixPath,
    BuildConfig
};