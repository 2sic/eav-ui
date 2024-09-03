import { computed, signal } from '@angular/core';
import { named } from './signal.utilities';
import { ComputedAnalyzer } from './computed-analyzer';

/**
 * Helper class to test the ComputedAnalyzer.
 * It should not be used in production code.
 * 
 * Basically you can modify it as needed while developing / testing the ComputedAnalyzer.
 */
export class ComputedAnalyzerTests {

  public testAnalyzers() {
    // temp computed to analyze dependencies
    const x = named('x', signal(27));
    const y = named('y', signal(42)); // indirect dependency
    const z = named('z', computed(() => x() + y()));
    const tempFromDisabled = computed(() => {
      return x() + " / " + z();
    });
    
    const analyzerTemp = new ComputedAnalyzer(tempFromDisabled);
    
    let valSubscribe = tempFromDisabled();
    console.log('snapshot before', {tempFromDisabled}, analyzerTemp.snapShotProducers());

    // make a change
    x.set(28);
    console.log('snapshot in between', {tempFromDisabled}, analyzerTemp.snapShotProducers());
    valSubscribe = tempFromDisabled();
    
    // console.log('analyzerTemp computed', tempFromDisabled);
    // console.log('analyzerTemp producers', analyzerTemp.getDirtyProducers());
    console.log('snapshot after', {tempFromDisabled}, analyzerTemp.snapShotProducers());

  }
}