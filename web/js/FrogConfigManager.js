class FrogConfigManager {
  static readMainConfig() {
    if (fs.existsSync(path.join(__appData, "config.json"))) {
      var parse = JSON.parse(fs.readFileSync(path.join(__appData, "config.json")));
      if(typeof parse.enableSounds === "undefined"){
        parse.enableSounds = true;
        this.writeMainConfig(parse);
      }
      if(typeof parse.autoInstallFabricAPI === "undefined"){
        parse.autoInstallFabricAPI = true;
        this.writeMainConfig(parse);
      }
      return parse;
    } else {
      return false;
    }
  }

  static writeMainConfig(config) {
    fs.writeFileSync(
      path.join(__appData, "config.json"),
      JSON.stringify(config, null, "\t")
    );
    FrogBackendCommunicator.logBrowserConsole(
      "[CONFMAN]",
      "Main config saved successfully"
    );
    return true;
  }

  static writeAndRefreshMainConfig(config) {
    mainConfig = config;
    this.writeMainConfig(config);
  }

  static writeDefaultMainConfig() {
    FrogBackendCommunicator.logBrowserConsole(
      "[CONFMAN]",
      "Main config will be rewritten to default"
    );
    var defaultCfg = {
      selectedMemorySize: (FrogInfo.getMaxRAMSize() / 1024).toFixed(1) / 2,
      selectedJava: "auto",
      selectedBaseDirectory: FrogInfo.getDefaultDotMinecraft(),
      selectedTheme: "indigo",
      selectedBackground: "3",
      selectedBaseFont: "default",
      lastSelectedAccount: "none",
      lastSelectedVersion: "none",
      openConsoleOnStart: false,
      launcherStoryViewed: false,
      eulaAccepted: false,
      oobeFinished: false,
      disappearOnStart: true,
      installedModsCache: {},
      storeGameResInRoot: true
    };
    this.writeAndRefreshMainConfig(defaultCfg);
    return defaultCfg;
  }
}
