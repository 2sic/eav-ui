import { Context } from '../../shared/services/context';
import { PipelineModel } from '../models';

/**
 * Check if there are special warnings the developer should know.
 * Typically when the test-module-id is different from the one we're currently
 * working on, or if no test-module-id is provided
 */
export function calculateWarnings(pipelineModel: PipelineModel, context: Context) {
  const warnings: string[] = [];

  try {
    // catch various not-initialized errors
    const testParams = pipelineModel.Pipeline.TestParameters;
    const testLines = testParams?.split(/\r?\n/) || [];

    const queryParams = pipelineModel.Pipeline.Params;
    const queryLines = queryParams?.split(/\r?\n/) || [];

    // check if we should show the warning about the Test ModuleId
    // this is because in the old days, the ModuleId wasn't auto-filled, so people had to add it as a test-value
    // now it's not necessary any more
    const midRegEx = /^\[module:moduleid\]=([0-9]*)$/gmi; // capture the mod-id
    const matches = midRegEx.exec(testParams);
    if(matches) {
      const testMid = matches[1];
      const urlMid = context.moduleId.toString();
      if (testMid !== urlMid) {
        warnings.push(`Your test moduleid (${testMid}) is different from the current moduleid (${urlMid}). Note that 2sxc 9.33 automatically provides the moduleid - so you usually do not need to set it any more.`);
      }
    }

    // Check if the syntax on test-parameters is off
    // It should contain [...]=...
    // But it's easy to forget the [ and ] brackets
    const correctSyntaxRegEx = /^\[[a-zA-Z]+:[a-zA-Z]+\]=(.*)$/gmi;
    if(testLines.length) {
      testLines.forEach(line => {
        // only check lines which have something
        if(line?.trim().length > 0 ?? false) {
          const lineMatch = correctSyntaxRegEx.exec(line);
          if(lineMatch == null)
            warnings.push(`A Test Parameter seems wrong: <br>
            <code>${line}</code> <br>
            - it should use the syntax <br>
            <code>[source:key]=value</code>`);
        }
      });
    }
  } catch (error) {
    console.error('Something went wrong in calculateWarnings for params', error);
  }

  return warnings;
}
