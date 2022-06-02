import { Context } from '../../shared/services/context';
import { PipelineModel } from '../models';

/**
 * Check if there are special warnings the developer should know.
 * Typically when the test ModuleId is different from the one we're currently working on
 */
export function calculateWarnings(pipelineModel: PipelineModel, context: Context) {
  const warnings: string[] = [];

  try {
    const queryParams = pipelineModel.Pipeline.Params?.split(/\r?\n/) || [];
    const testParams = pipelineModel.Pipeline.TestParameters?.split(/\r?\n/) || [];

    queryParams.forEach(param => {
      param = param?.trim();
      if (!param) { return; }

      // Check if the syntax on Query Parameters is off.
      // It should contain [...]=...
      // But it's easy to forget the [ and ] brackets
      const paramSyntax = /^[a-zA-Z0-9]+=(.*)$/gmi;
      const matched = paramSyntax.test(param);
      if (!matched) {
        warnings.push(`
          A <em>Query Parameter</em> seems wrong: <br>
          <code>${param}</code> <br>
          It should use the syntax: <br>
          <code>key=value</code> <br>
          or resolve to a token like: <br>
          <code>key=[source:key]</code>
        `);
      }
    });

    testParams.forEach(param => {
      param = param?.trim();
      if (!param) { return; }

      // Check if the syntax on Test Parameters is off.
      // It should contain [...]=...
      // But it's easy to forget the [ and ] brackets
      const testParamSyntax = /^\[[a-zA-Z]+:[a-zA-Z0-9]+\]=(.*)$/gmi;
      const matched = testParamSyntax.test(param);
      if (!matched) {
        warnings.push(`
          A <em>Test Parameter</em> seems wrong: <br>
          <code>${param}</code> <br>
          It should use the syntax: <br>
          <code>[source:key]=value</code>
        `);
      }

      // Check if we should show the warning about the test ModuleId.
      // This is because in the old days, the ModuleId wasn't auto-filled, so people had to add it as a test value.
      // Now it's not necessary any more
      const midRegex = /^\[module:id\]=([0-9]*)$/gmi;
      const midMatch = midRegex.exec(param);
      if (midMatch) {
        const testMid = midMatch[1];
        const urlMid = context.moduleId?.toString();
        if (testMid !== urlMid) {
          warnings.push(`
            Your test ModuleId (${testMid}) is different from the current ModuleId (${urlMid}).<br>
            Note that 2sxc automatically provides the ModuleId - so you usually do not need to set it
          `);
        }
      }

      const oldMidRegex = /^\[module:moduleid\]=([0-9]*)$/gmi;
      const oldMidMatch = oldMidRegex.exec(param);
      if (oldMidMatch) {
        warnings.push(`
          You are using deprecated [Module:ModuleId] test parameter.<br>
          Please use [Module:Id]
        `);
      }
    });
  } catch (error) {
    console.error('Something went wrong in calculateWarnings for params', error);
  }

  return warnings;
}
