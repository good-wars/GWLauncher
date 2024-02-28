class FrogVanillaCompiler {
  // Function for generating vanilla start args
  static compileVanillaArguments(
    rootDirectory,
    version,
    authData,
    maxMemory,
    javaPath = "java.exe",
    versionType = "release"
  ) {
    var launch_arguments = {
      authorization: authData,
      root: rootDirectory,
      cache: path.join(rootDirectory, "cache"),
      version: {
        number: version,
        type: versionType,
      },
      javaPath: javaPath,
      memory: {
        max: maxMemory,
        min: "1G",
      },
      overrides: {
        gameDirectory: rootDirectory,
        maxSockets: 2,
      },
    };
    return launch_arguments;
  }

  // Vanilla start process
  static startVanilla(version, memory, type = "release") {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, vanillaStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogStartManager.getFinalJavaPath(version, (finalJP) => {
        startArguments = this.compileVanillaArguments(
          mainConfig.selectedBaseDirectory,
          version,
          authData,
          memory,
          finalJP,
          type
        );
        vanillaStarter = new FrogVanillaStarter(startArguments);
        vanillaStarter.launch();
      });
    });
  }

  static getDataByVersion(version, cb) {
    var retValue = false;
    FrogVersionsManager.getVanillaReleases(
      (vanilla_releases) => {
        vanilla_releases.forEach((vanilla_release) => {
          if (vanilla_release.version == version) {
            retValue = this.compileDataFromRaw("", vanilla_release);
          }
        });
        cb(retValue);
      },
      true,
      true,
      true
    );
  }

  static compileDataFromRaw(installedVersions = "", data) {
    var vanInstalled = false;
    if (installedVersions == "") {
      installedVersions = FrogVersionsManager.getInstalledVersionsList();
    }
    if(installedVersions.includes(data.version)){
      installedVersionsChk.splice(installedVersionsChk.indexOf(data.version), 1);
      vanInstalled = true;
    }
    var retValue = {
      shortName: "vanilla-" + data.version,
      version: data.version,
      url: data.manifestURL,
      releaseType: data.type,
      type: "vanilla",
      installed: installedVersions.includes(data.version),
    };
    return retValue;
  }
}
