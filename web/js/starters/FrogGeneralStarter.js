class FrogGeneralStarter {
  static launchGeneral(options, displayName) {
    if(typeof options.customArgs != "object"){
      options.customArgs = [];
    }
    if(typeof options.customLaunchArgs != "object"){
      options.customLaunchArgs = [];
    }
    if(selectedServerFromList !=  ""){
      options.customLaunchArgs.push("--server");
      options.customLaunchArgs.push(selectedServerFromList.split(":")[0]);
      options.customLaunchArgs.push("--port");
      options.customLaunchArgs.push(selectedServerFromList.split(":")[1]);
      selectedServerFromList = "";
    }
    if(mainConfig.storeGameResInRoot == false){
      if(typeof options.version.custom !== "undefined"){
        options.overrides.gameDirectory = path.join(mainConfig.selectedBaseDirectory, "versions", options.version.custom);
      } else {
        options.overrides.gameDirectory = path.join(mainConfig.selectedBaseDirectory, "versions", options.version.number);
      }
    }
    options.overrides.maxSockets = 1;
    if (selectedAccount.type == "elyby") {
      var authInjPath = path.join(
        mainConfig.selectedBaseDirectory,
        "cache",
        FrogUtils.getFilenameFromURL(modloadersMyInfo.authlibInjector)
      );
      if (!fs.existsSync(authInjPath)) {
        FrogUI.changeBottomControlsStatus(false, true, true);
        FrogDownloadManager.downloadByURL(
          modloadersMyInfo.authlibInjector,
          authInjPath,
          () => {
            options.customArgs.push("-javaagent:" + authInjPath.replace(/\\/, "/") + "=ely.by");
            this.proceedToLaunch(options, displayName);
          }
        );
      } else {
        options.customArgs.push("-javaagent:" + authInjPath.replace(/\\/, "/") + "=ely.by");
        this.proceedToLaunch(options, displayName);
      }
    } else {
      this.proceedToLaunch(options, displayName);
    }
  }

  static proceedToLaunch(options, displayName) {
    var launcher = new Client();
    FrogUI.changeBottomControlsStatus(false, false, true);
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start",
      displayName,
      options.version.number
    );
    launcher.launch(options);
    launcher.on("debug", (e) => {
      FrogErrorsParser.parse(e);
      FrogBackendCommunicator.logBrowserConsoleOnly(e);
    });
    launcher.on("close", (e) => {
      FrogStartManager.parseStartStatus("mclc-close-evt");
      FrogErrorsParser.parse("", e);
    });
    launcher.on("data", (e) => {
      FrogBackendCommunicator.logBrowserConsoleOnly(e);
      FrogStartManager.parseStartStatus(e);
      FrogErrorsParser.parse(e);
    });
    launcher.on("arguments", (e) => {
      anyDownloading = false;
      FrogStartManager.parseStartStatus("mclc-start-evt");
    });
    launcher.on("download-status", function (e) {
      FrogDownloadManager.handleDownloadStatusV2(e);
    });
  }
}
