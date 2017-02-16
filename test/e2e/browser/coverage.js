import fs from 'fs';
import istanbul from 'istanbul-api';

export default function createReport(coverage) {

  const nycConfig = JSON.parse(process.env.NYC_CONFIG);
  const dir = nycConfig.tempDirectory || '.nyc_output';
  const id = process.env.NYC_ROOT_ID || 'browser';

  const coverageMap = istanbul.libCoverage.createCoverageMap();
  const sourceMapStore = istanbul.libSourceMaps.createSourceMapStore();

  Object.keys(coverage).forEach(filename => {
    const fileCoverage = coverage[filename];

    fileCoverage.inputSourceMap.sources = fileCoverage.inputSourceMap.sources.map(source => {
      if (source.indexOf('!') !== -1) {
        return source.split('!').pop();
      }
      return source;
    });

    coverageMap.addFileCoverage(fileCoverage);
  });

  const remappedCoverageMap = sourceMapStore.transformCoverage(coverageMap).map;

  fs.writeFileSync(`${dir}/${id}.json`, JSON.stringify(remappedCoverageMap));

};
