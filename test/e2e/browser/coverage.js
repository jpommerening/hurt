/*global __coverage__*/
import istanbul from 'istanbul-api';

export default function createReport(coverage) {
  if (!coverage || !__coverage__) {
    return;
  }

  const coverageMap = istanbul.libCoverage.createCoverageMap();
  const sourceMapStore = istanbul.libSourceMaps.createSourceMapStore();

  Object.keys(coverage).forEach(filename => {
    const cov = coverage[filename];

      /*
    if (cov.inputSourceMap) {
      cov.inputSourceMap.sources = cov.inputSourceMap.sources.map(source => {
        if (source.indexOf('!') !== -1) {
          return source.split('!').pop();
        }
        return source;
      });
    }
    */

    coverageMap.addFileCoverage(cov);
  });

  const remappedCoverage = sourceMapStore.transformCoverage(coverageMap).map;

  const currentCoverage = istanbul.libCoverage.createCoverageMap(__coverage__);

  remappedCoverage.files().forEach(filename => {
    currentCoverage.addFileCoverage(remappedCoverage.fileCoverageFor(filename));
    __coverage__[filename] = JSON.parse(JSON.stringify(currentCoverage.fileCoverageFor(filename)));
  });
}
