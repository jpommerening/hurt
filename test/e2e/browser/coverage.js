import istanbul from 'istanbul-api';

const __coverage__ = global.__coverage__ || (global.__coverage__ = {});

export default function createReport(coverage) {
  if (!coverage || !__coverage__) {
    return;
  }

  const coverageMap = istanbul.libCoverage.createCoverageMap(coverage);
  const sourceMapStore = istanbul.libSourceMaps.createSourceMapStore();
  const remappedCoverage = sourceMapStore.transformCoverage(coverageMap).map;
  const currentCoverage = istanbul.libCoverage.createCoverageMap(__coverage__);

  remappedCoverage.files().forEach(filename => {
    currentCoverage.addFileCoverage(remappedCoverage.fileCoverageFor(filename));
    __coverage__[filename] = JSON.parse(JSON.stringify(currentCoverage.fileCoverageFor(filename)));
  });
}
