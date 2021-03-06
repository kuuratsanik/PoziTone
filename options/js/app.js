var optionsApp = angular.module(
    'optionsApp'
  , [ 'ngRoute', 'optionsControllers' ]
  , function( $compileProvider ) {
      var
          currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist()
        , newImgSrcSanitizationWhiteList =
              currentImgSrcSanitizationWhitelist.toString().slice( 0, -1 )
            + '|chrome-extension:'
            + currentImgSrcSanitizationWhitelist.toString().slice( -1 )
        ;

      $compileProvider
        .imgSrcSanitizationWhitelist( newImgSrcSanitizationWhiteList )
        .aHrefSanitizationWhitelist(
          /^\s*(https?|ftp|mailto|chrome-extension):/
        )
        ;
    }
);

optionsApp.config( [ '$routeProvider', function( $routeProvider ) {
  // IMPORTANT!
  // If any URLs to change, also change logic in optionsApp.run
  $routeProvider
    .when( '/settings/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller  : 'SettingsCtrl'
    } )
    .when( '/settings/modules/built-in', {
        templateUrl : 'partials/settings-modules-list.html'
      , controller  : 'SettingsModulesListCtrl'
    } )
    .when( '/settings/modules/built-in/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller  : 'SettingsCtrl'
    } )
    .when( '/settings/modules/external', {
        templateUrl : 'partials/external-modules-list.html'
      , controller  : 'ExternalModulesListCtrl'
    } )
    .when( '/settings/modules/external/:moduleId', {
        templateUrl : 'partials/settings.html'
      , controller  : 'SettingsCtrl'
    } )
    .when( '/projects', {
        templateUrl : 'partials/projects.html'
      , controller  : 'ProjectsCtrl'
    } )
    .when( '/contribution', {
        templateUrl : 'partials/contribution.html'
      , controller  : 'ContributionCtrl'
    } )
    .when( '/feedback', {
        templateUrl : 'partials/feedback.html'
      , controller  : 'FeedbackCtrl'
    } )
    .when( '/about', {
        templateUrl : 'partials/about.html'
      , controller  : 'AboutCtrl'
    } )
    .when( '/help', {
        templateUrl : 'partials/help.html'
      , controller  : 'HelpCtrl'
    } )
    .otherwise( {
        redirectTo  : '/settings/general'
    } )
    ;
} ] );

optionsApp.run( function( $rootScope, $location ) {
  var strLog = strLog = 'optionsApp.run';
  Log.add( strLog, $location );

  Global.getStorageItems(
      StorageLocal
    , 'strOptionsPageToOpen'
    , strLog
    , function( objReturn ) {
        var strOptionsPageToOpen = objReturn.strOptionsPageToOpen;

        if ( strOptionsPageToOpen !== '' ) {
          var strPath = '/' + strOptionsPageToOpen;

          if ( strOptionsPageToOpen === 'modulesBuiltIn' ) {
            strPath = '/settings/modules/built-in';
          }
          else if ( strOptionsPageToOpen === 'modulesExternal' ) {
            strPath = '/settings/modules/external';
          }

          var objItems = { strOptionsPageToOpen : '' };

          Global.setStorageItems(
              StorageLocal
            , objItems
            , strLog + strConstGenericStringSeparator + 'resetOptionsPageToOpen'
            , function() {
                $rootScope.boolPreventLocationOverriding = true;
                $location.path( strPath );
              }
            , undefined
            , objItems
            , true
          );
        }
      }
  );

  /**
   * Get built-in and external connected modules.
   * 
   * TODO: Replace with Global.getModules()
   *
   * @type    method
   * @param   Storage
   *            Local or Sync Storage API.
   * @return  void
   **/
  $rootScope.getModules = function( Storage ) {
    if ( typeof $rootScope.objModules !== 'object' || Array.isArray( $rootScope.objModules ) ) {
      $rootScope.objModules = {};
    }

    if ( typeof $rootScope.objExternalModules !== 'object' || Array.isArray( $rootScope.objExternalModules ) ) {
      $rootScope.objExternalModules = {};
    }

    var arrModulesNames = $rootScope.arrModulesNames;

    $rootScope.intModulesBuiltIn = 0;
    $rootScope.intModulesExternal = 0;

    Storage.get( null, function( objStorage ) {
      for ( var strKey in objStorage ) {
        if (  objStorage.hasOwnProperty( strKey )
          &&  strKey.indexOf( strConstSettingsPrefix ) === 0
        ) {
          var strModule = strKey.replace( strConstSettingsPrefix, '' )
            , objModule = objStorage[ strKey ]
            ;

          objModule.id = strModule;

          // TODO: Avoid confusion when StorageSync === StorageLocal
          if ( Storage === StorageSync ) {
            // Check if built-in module is available
            if (  ! Global.objModules[ strModule ]
              &&  strModule !== strConstGeneralSettingsSuffix
            ) {
              continue;
            }

            var strModuleVar = 'module_' + strModule;

            objModule.type = 'built-in';
            objModule.caption = chrome.i18n.getMessage( strModuleVar );
            objModule.captionLong = chrome.i18n.getMessage( strModuleVar + '_long' );

            if ( strModule !== strConstGeneralSettingsSuffix ) {
              arrModulesNames.push( {
                  strModuleId : strModule
                , strModuleName :  objModule.caption
              } );
            }

            $rootScope.intModulesBuiltIn++;
          }
          else {
            var strModuleExternal = strModule.substr( 0, strModule.lastIndexOf( strConstExternalModuleSeparator ) );

            objModule.type = 'external';
            objModule.caption = strModuleExternal;
            // TODO: Get i18n variotions of name
            objModule.name = objStorage[ strKey ].strName || strModuleExternal;

            arrModulesNames.push( {
                strModuleId : strModule
              , strModuleName :  objModule.name
            } );

            $rootScope.intModulesExternal++;

            // TODO: Avoid name clashes
            $rootScope.objExternalModules[ strModuleExternal ] = objModule;
          }

          // Keep settings in $rootScope
          $rootScope.objModules[ strModule ] = objModule;
        }
      }

      /*
       * Sort modules by name disregarding letter case.
       *
       * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Sorting_with_map
       */

      // temporary array holds objects with position and sort-value
      var mapped = arrModulesNames.map( function( el, i ) {
        return { index: i, value: el.strModuleName.toLowerCase() };
      } );

      // sorting the mapped array containing the reduced values
      mapped.sort( function( a, b ) {
        return +( a.value > b.value ) || +( a.value === b.value ) - 1;
      } );

      // container for the resulting order
      $rootScope.arrModulesNames = mapped.map( function( el ) {
        return arrModulesNames[ el.index ];
      } );
    } );
  };

  // Get available modules on load
  $rootScope.arrModulesNames = [];
  $rootScope.getModules( StorageSync );
  $rootScope.getModules( StorageLocal );

  // Track external links clicks
  var $$externalLinks = null
    , $$externalLinkTarget
    , objExternalLinkTargetDataset
    , objLogDetails = objConstUserSetUp
    , strBeingTrackedClass = 'trackExternalLink'
    , arrExternalLinkClassList
    ;

  const objExternalLinks = {
      'features' : {
          'ru' : 'https://github.com/PoziWorld/PoziTone/blob/develop/README_ru.md#Возможности'
        , 'default' : 'https://github.com/PoziWorld/PoziTone/blob/develop/README_en.md#features'
      }
  };

  /**
   * Find all external links and add or remove listeners.
   *
   * @type    method
   * @param   boolAddListeners
   *            Whether to add or remove listeners.
   * @param   strContainerId
   *            ID of the container of the external links.
   * @param   strPage
   *            Name of the page.
   * @param   strSubpage
   *            Optional. Name of the subpage.
   * @param   strSubsection
   *            Optional. Name of the subpage.
   * @return  void
   **/
  $rootScope.toggleExternalLinksListeners = function(
      boolAddListeners
    , strContainerId
    , strPage
    , strSubpage
    , strSubsection
  ) {
    if ( typeof boolAddListeners === 'boolean' && boolAddListeners ) {
      $$externalLinks =
        document
          .getElementById( strContainerId )
          .getElementsByClassName( 'externalLink' )
        ;

      objLogDetails.strPage = strPage;
      objLogDetails.strSubpage = strSubpage;
      objLogDetails.strSubsection = strSubsection;

      [].forEach.call( $$externalLinks, function ( $$externalLink ) {
        arrExternalLinkClassList = $$externalLink.classList;

        if ( ! $$externalLink.classList.contains( strBeingTrackedClass ) ) {
          $$externalLink.addEventListener( 'click', function( objEvent ) {
            $rootScope.trackExternalLinkClick( objEvent );
          } );

          arrExternalLinkClassList.add( strBeingTrackedClass );
        }

        // Insert href
        const strId = $$externalLink.getAttribute( 'data-id' );

        if ( strId !== '' && strId in objExternalLinks ) {
          const strRequestedLang = $$externalLink.getAttribute( 'data-lang' );
          const objLinks = objExternalLinks[ strId ];
          const strChosenLang = strRequestedLang in objLinks
            ? strRequestedLang
            : 'default'
            ;

          $$externalLink.href = objLinks[ strChosenLang ];
        }
      } );
    }
    else if ( $$externalLinks && $$externalLinks.length ) {
      [].forEach.call( $$externalLinks, function ( $$externalLink ) {
        $$externalLink.removeEventListener( 'click', function( objEvent ) {
          $rootScope.trackExternalLinkClick( objEvent );
        } );
      } );
    }
  };

  /**
   * When a link leading to any website is clicked, track click.
   *
   * @type    method
   * @param   objEvent
   *            MouseEvent object.
   * @return  void
   **/
  $rootScope.trackExternalLinkClick = function( objEvent ) {
    // Clone
    var objLogDetailsLocal = JSON.parse( JSON.stringify( objLogDetails ) );

    $$externalLinkTarget = objEvent.target;
    objExternalLinkTargetDataset = $$externalLinkTarget.dataset;
    objLogDetailsLocal.strId =  objExternalLinkTargetDataset.id;

    if ( typeof objExternalLinkTargetDataset.params !== 'undefined' ) {
      var objParams = JSON.parse( objExternalLinkTargetDataset.params )
        , strKey
        ;

      for ( strKey in objParams ) {
        objLogDetailsLocal[ strKey ] = objParams[ strKey ];
      }
    }

    Log.add( 'externalLinkClick', objLogDetailsLocal, true );

    Global.createTabOrUpdate( $$externalLinkTarget.href );

    objEvent.preventDefault();
  };

  // Remove external links listeners
  $rootScope.$on( '$routeChangeStart', function() {
    $rootScope.toggleExternalLinksListeners( false );
  } );

  // Highlight a menu item corresponding to the active view on route change
  $rootScope.$on( '$routeChangeSuccess', function() {
    $rootScope.$$childHead.highlightActiveMenuItem();
  } );

  $rootScope.strRateUrl = strConstRateUrl;

  // Track rating stars clicks
  var $$stars = document.getElementsByClassName( 'rateCtaStar' );

  [].forEach.call( $$stars, function( $$star ) {
    $$star.addEventListener( 'click', function ( objEvent ) {
      $$target = objEvent.target;

      if ( $$target.className === 'rateCtaStar' ) {
        Log.add(
            'rateCtaClick'
          , { intRating : $$target.innerText }
          , true
        );

        Global.createTabOrUpdate( $$target.parentNode.href );

        objEvent.preventDefault();
      }
    } );
  } );
} );

optionsApp.controller( 'MenuController', function( $scope, $rootScope, $location ) {
  $scope.arrPages = [ 'projects', 'contribution', 'feedback', 'about', 'help' ];

  /**
   * Highlight a menu item corresponding to the active view
   * Self-invoke
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  $scope.highlightActiveMenuItem = function() {
    var $targetMenuItem =
          document.querySelector(
            '[ng-href="#' + $location.path() + '"].menuItem'
          );

    if ( document.contains( $targetMenuItem ) ) {
      var $allMenuItemWraps = document.getElementsByClassName( 'menuItemWrap' );

      // Deselect previous active menu item
      for ( var j = 0, m = $allMenuItemWraps.length; j < m; j++ )
        $allMenuItemWraps[ j ].classList.remove( 'selected' );

      // Select current active menu item and make sure it's in viewport
      const $active = $targetMenuItem.parentNode;

      $active.classList.add( 'selected' );
      $active.scrollIntoView();
    }
  };

  // When all module menu items are templated
  $scope.$on( 'onLastModuleMenuItem', function(scope){
    scope.currentScope.highlightActiveMenuItem();
  });
} );

/**
 * List of modules navigational menu directive.
 **/
optionsApp.directive( 'moduleMenuItemDirective', function() {
  return function( scope, element, attributes ) {
    if ( scope.$last ) {
      // ng-repeat is asynchronous
      // http://www.nodewiz.biz/angular-js-final-callback-after-ng-repeat/
      setTimeout(
          function() {
            scope.$emit( 'onLastModuleMenuItem' );
          }
        , 1
      );
    }
  };
} );

/**
 * Add event listeners when all message CTAs got displayed.
 **/
optionsApp.directive( 'messageDisplayedWatcher', function() {
  return function( scope, element, attributes ) {
    // http://stackoverflow.com/a/21361421
    scope.$watch(
        function () {
          return element[ 0 ].childNodes.length;
        }
      , function ( intNewValue, intOldValue ) {
          if ( intNewValue !== intOldValue ) {
            Page.addDevelopersMessageEventListeners();
          }
        }
    );
  };
} );

var optionsControllers = angular.module( 'optionsControllers', [] );

// Output string/message in the appropriate language
optionsControllers.directive( 'localize', function( $rootScope ) {
  return function localize( $scope, element, attributes ) {
    $scope.$watch( function() {
      var strId = attributes.id;

      Page.localize( strPage, '#' + strId );

      $rootScope.toggleExternalLinksListeners(
          true
        , strId
        , strPage
        , strSubpage
        , strSubsection
      );
    } );
  };
} );
