var lastVersionsFilters = "all all";
var lastVanillaShowType = "release";
const GAME_VERSION_ITEM_BASE =
  '<li class="version-item cursor-pointer" data-version="$1" data-shortname="$5" onclick="FrogVersionsUI.changeActiveVersion(' +
  "'$5'" +
  '); FrogUI.goHomeSection()"><img src="assets/ver_icons/$2.png" class="rounded-md" style="height: 24px" /><span class="ml-3">$3</span>$4</li>';
const GAME_VERSION_INSTALLED = '<span class="gray ml-2">(Установлена)</span>';
const GAME_VERSION_BTN_BASE =
  '<div class="flex rounded items-center"><img src="$1" style="height: 24px;"><div class="ml-3">$2</div></div>';

class FrogVersionsUI {
  static refreshVersionsListModal = (
    filters = "all all",
    vanillaShowType = "release"
  ) => {
    lastVersionsFilters = filters;
    lastVanillaShowType = vanillaShowType;
    $("#version-selector-mmodal .loading-overlay").removeClass("hidden");
    $("#version-selector-mmodal #game-versions-list")
      .parent()
      .addClass("hidden");
    var vi,
      accepted = false;
    var filters = filters.split(" ");
    FrogVersionsManager.getAllVersionsList((gameVersions) => {
      $("#version-selector-mmodal #game-versions-list").html("");
      gameVersions.forEach((version) => {
        if (
          filters[0] == "all" ||
          (filters[0] == "installed" && version.installed == true)
        ) {
          if (
            filters[1] == "all" ||
            (filters[1] == "forge" && version.type == "forge") ||
            version.type == "legacyforge" ||
            (filters[1] == "fabric" && version.type == "fabric") ||
            (filters[1] == "vanilla" && version.type == "vanilla") ||
            (filters[1] == "forgeoptifine" &&
              version.type == "forgeoptifine") ||
            version.type == "legacyforgeoptifine" ||
            (filters[1] == "fabricsodiumiris" &&
              version.type == "fabricsodiumiris")
          ) {
            if (typeof version.releaseType !== "undefined") {
              if (
                version.releaseType == vanillaShowType ||
                vanillaShowType == "all"
              ) {
                accepted = true;
              } else {
                accepted = false;
              }
            } else {
              accepted = true;
            }
          } else {
            accepted = false;
          }
        } else {
          accepted = false;
        }

        if (
          typeof version.installed !== "undefined" &&
          version.installed == true
        ) {
          vi = GAME_VERSION_INSTALLED;
        } else {
          vi = "";
        }

        if (accepted == true) {
          $("#version-selector-mmodal #game-versions-list").append(
            GAME_VERSION_ITEM_BASE.replaceAll(/\$1/gim, version.version)
              .replaceAll(/\$2/gim, version.type)
              .replaceAll(
                /\$3/gim,
                FrogVersionsManager.generateVersionDisplayname(version)
              )
              .replaceAll(/\$4/gim, vi)
              .replaceAll(/\$5/gim, version.shortName)
          );
        }
      });
      $("#version-selector-mmodal .loading-overlay").addClass("hidden");
      $("#version-selector-mmodal #game-versions-list")
        .parent()
        .removeClass("hidden");
    });
  };

  static refreshVersionsWithFilters() {
    $("#version-search-input").val("");
    var filters1,
      filters2,
      filters = "",
      vanillaType;
    filters1 = $(
      "#version-selector-mmodal #version-category-selector .inline-block.active"
    ).data("filter");
    filters2 = $(
      "#version-selector-mmodal #version-type-selector .inline-block.active"
    ).data("filter");
    filters = filters1 + " " + filters2;
    vanillaType = $(
      "#version-selector-mmodal #vanilla-type-selector .inline-block.active"
    ).data("type");
    this.refreshVersionsListModal(filters, vanillaType);
  }

  static changeActiveVersion(shortName) {
    FrogBackendCommunicator.logBrowserConsole(
      "[ACCMAN]",
      "Changing active version to",
      shortName
    );
    if (shortName.match(/3rdparty\-/gi) == null) {
      var versionData = {
        type: shortName.split("-")[0],
        version: shortName.split("-")[1],
      };
    } else {
      var versionData = {
        type: shortName.split("-")[0],
        shortName: shortName,
      };
    }
    var versionDisplayname =
      FrogVersionsManager.generateVersionDisplayname(versionData);
    var versionHTML = GAME_VERSION_BTN_BASE.replaceAll(
      /\$1/gim,
      "assets/ver_icons/" + versionData.type + ".png"
    ).replaceAll(/\$2/gim, versionDisplayname);
    $("#show-version-selector").html(versionHTML);
    mainConfig.lastSelectedVersion = shortName;
    if (
      (versionData.type == "fabric" &&
        mainConfig.autoInstallFabricAPI == true) ||
      versionData.type == "fabricsodiumiris"
    ) {
      $("#fabricapi-notify").removeClass("hidden");
      setTimeout(() => {
        $("#fabricapi-notify").addClass("hidden");
      }, 5000);
      FrogUI.refreshAbsoluteElementsPositions();
    } else {
      $("#fabricapi-notify").addClass("hidden");
    }
    selectedGameVersion = shortName;
    FrogConfigManager.writeAndRefreshMainConfig(mainConfig);
  }

  static searchVersions(query) {
    var searchRegex = new RegExp(query, "gmi");
    $("#version-selector-mmodal #game-versions-list .version-item").each(
      function (i, elem) {
        var itemText = $(elem).find("span.ml-3").text();
        if (itemText.match(searchRegex) != null) {
          $(elem).removeClass("hidden");
        } else {
          $(elem).addClass("hidden");
        }
      }
    );
  }

  static resetCatSelectors() {
    $("#version-category-selector li div.active").removeClass("active");
    $("#version-category-selector li:first-child div").addClass("active");
    $("#version-type-selector li div.active").removeClass("active");
    $("#version-type-selector li:first-child div").addClass("active");
  }
}
