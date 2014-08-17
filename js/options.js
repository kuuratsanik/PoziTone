/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/options.js
  Description             :           Options JavaScript

  Table of Contents:

  0. Globals
  1. Options
      init()
      setPageValues()
      getAvailableOptions()
      onSettingChange()
      switchPage()
      populateModulesList()
      addEventListeners()
      onChooseSubpageChange()
      chooseSubpage()
      displayCurrentVersion()
  2. Listeners
      runtime.onMessage
  3. Events

 ============================================================================ */

/* =============================================================================

  0. Globals

 ============================================================================ */

var
    $allInputs // All <input />
  , intInputs  // Num of $allInputs
  , $settingsSaved
  , $settingsSubpages
  , $chooseSubpageForm
  , $chooseSubpage
  , $chosenSubpage

  , strModuleLocalPrefix      = 'module_'
  , strChooseSubpageFormId    = 'chooseSubpageForm'
  , strChooseSubpageId        = 'chooseSubpage'
  , strChosenSubpageId        = 'chosenSubpage'
  , strModulesListId          = 'chooseSubpageList'
  , strSettingsId             = 'settings'
  , strSettingsSavedId        = 'settingsSaved'
  , strModuleSubpageIdPrefix  = 'settings_'
  , strSettingsSubpageClass   = 'settingsSubpage'
  , strVersionId              = 'version'
  , strEnableModule           = 'boolIsEnabled'

  , intSettingsSubpages
  ;

/* =============================================================================

  1. Options

 ============================================================================ */

var Options = {

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Page.localize( 'options' );
    Options.setPageValues();
    Options.getAvailableOptions();
    Options.populateModulesList();
    Options.addEventListeners();
    Options.displayCurrentVersion();
  }
  ,

  /**
   * Set values when DOM is ready
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setPageValues : function() {
    $allInputs          = document.querySelectorAll( '.subpage input' );
    intInputs           = $allInputs.length;

    $settingsSaved      = document.getElementById( strSettingsSavedId );
    $settingsSubpages   = document
                            .getElementsByClassName( strSettingsSubpageClass );
    intSettingsSubpages = $settingsSubpages.length;

    $chooseSubpageForm  = document.getElementById( strChooseSubpageFormId );
    $chooseSubpage      = document.getElementById( strChooseSubpageId );
    $chosenSubpage      = document.getElementById( strChosenSubpageId );
  }
  ,

  /**
   * Get available options and set their stored values
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAvailableOptions : function() {
    var arrAvailableOptions = [];

    for ( var i = 0; i < intSettingsSubpages; i++ ) {
      var
          objSettingsSubpage        = $settingsSubpages[ i ]
        , strModule                 = objSettingsSubpage
                                        .id
                                          .replace(
                                              strModuleSubpageIdPrefix
                                            , ''
                                          )
        , strStorageVar             = strConstSettingsPrefix + strModule
        ;

      arrAvailableOptions.push( strStorageVar );
    }

    StorageSync.get( arrAvailableOptions, function( objStorageData ) {
      for ( var strKey in objStorageData ) {
        if ( objStorageData.hasOwnProperty( strKey ) ) {
          var
              objModuleSettings         = objStorageData[ strKey ]
            , strModule                 = strKey
                                            .replace(
                                                strConstSettingsPrefix
                                              , ''
                                            )
            , strModuleSubpageId        = strModuleSubpageIdPrefix + strModule
            , $moduleSubpage            = document
                                            .getElementById(
                                              strModuleSubpageId
                                            )
            , $allModuleSubpageInputs   = $moduleSubpage
                                            .getElementsByTagName( 'input' )
            , intModuleSubpageInputs    = $allModuleSubpageInputs.length
            ;

          for ( i = 0; i < intModuleSubpageInputs; i++ ) {
            var
                $input            = $allModuleSubpageInputs[ i ]
              , strVarName        = $input.name
              , strVarType        = $input.type
              , strVarValue       = $input.value
              , miscStorageVar    = objModuleSettings[ strVarName ]
              ;

            if ( typeof miscStorageVar !== 'undefined' ) {
              if ( strVarType === 'checkbox' ) {
                if ( typeof miscStorageVar === 'boolean' )
                  $input.checked = miscStorageVar;
                else if (
                      typeof miscStorageVar === 'object'
                  &&  miscStorageVar.indexOf( strVarValue ) !== -1
                )
                  $input.checked = true;
              }
              else if (
                    strVarType === 'radio'
                &&  typeof miscStorageVar === 'string'
                &&  miscStorageVar === strVarValue
              )
                $input.checked = true;
            }
          }
        }
      }
    });
  }
  ,

  /**
   * Assign change listeners for settings
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  onSettingChange : function( objEvent ) {
    var
        $this                 = objEvent.target
      , objTemp               = {}
      , objModuleSettings     = {}
      , miscSetting
      , strModuleSettings
      , strChosenSubpageValue = $chosenSubpage.value
      ;

    if ( $this.type === 'checkbox' && $this.value === 'on' ) {
      var boolIsChecked = $this.checked;

      miscSetting = boolIsChecked;

      if ( $this.name === strEnableModule && ! boolIsChecked )
        Options.removeModuleNotifications( strChosenSubpageValue );
    }
    else if ( $this.type === 'checkbox' && $this.value !== 'on' ) {
      var
          $moduleSubpage  = document
                              .getElementById(
                                strModuleSubpageIdPrefix + strChosenSubpageValue
                              )
        , $group          = $moduleSubpage.querySelectorAll(
                              'input[name="' + $this.name + '"]'
                            )
        , arrTemp         = []
        ;

      for ( var i = 0; i < $group.length; i++ ) {
        var $groupEl = $group[ i ];

        if ( $groupEl.checked )
          arrTemp.push( $groupEl.value );
      }

      miscSetting = arrTemp;
    }
    else if ( $this.type === 'radio' )
      miscSetting = $this.value;

    strModuleSettings = strConstSettingsPrefix + strChosenSubpageValue;

    // TODO: Is there a need for objTemp?
    objTemp[ strModuleSettings ] = {};
    objTemp[ strModuleSettings ][ $this.name ] = miscSetting;
    objModuleSettings[ $this.name ] = miscSetting;

    if ( ! Global.isEmpty( objTemp ) )
      StorageSync.get( strModuleSettings, function( objReturn ) {
        for ( var strKey in objModuleSettings ) {
          if ( objModuleSettings.hasOwnProperty( strKey ) )
            objReturn[ strModuleSettings ][ strKey ] = 
              objModuleSettings[ strKey ];
        }

        // TODO: Add callback to Global.setStorageItems() and then utilize it
        StorageSync.set( objReturn, function() {
          Page.showSuccess( $settingsSaved );

          // Debug
          StorageSync.get( null, function(data) {
            console.log(data);
          });
        });
      });
  }
  ,

  /**
   * Switch page
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  switchPage : function( objEvent ) {
    var
        $target     = objEvent.target
      , strPageId   = $target.hash.replace( '#', '' )
      , $page       = document.getElementById( strPageId )
      ;

    if ( document.contains( $page ) ) {
      // 1. Hide all pages, show called.
      var $allPages = document.getElementsByClassName( 'page' );

      for ( var i = 0, intPages = $allPages.length; i < intPages; i++ )
        $allPages[ i ].style.display = 'none';

      $page.style.display = 'block';

      // 2. Make menu link active.
      // TODO: Switch to querySelector(All)? Performance vs Less code
      var
          $allMenuLinks = document
                            .getElementById( 'menu' )
                              .getElementsByTagName( 'li' )
        , j
        ;

      for ( j = 0, intMenuLinks = $allMenuLinks.length; j < intMenuLinks; j++ )
        $allMenuLinks[ j ].classList.remove( 'selected' );

      $target.parentNode.classList.add( 'selected' );
    }

    return false;
  }
  ,

  /**
   * Populate modules list
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  populateModulesList : function() {
    var
        $options    = document.getElementById( strModulesListId ).children
      ;

    for ( var i = 0, intOptions = $options.length; i < intOptions; i++ ) {
      var
          $this         = $options[ i ]
        , strValue      = strModuleLocalPrefix + $this.dataset.module
        , strLocalValue = chrome.i18n.getMessage( strValue )
        ;

      $this.value = strLocalValue;
      $this.dataset.lowercasevalue = strLocalValue.toLowerCase();
    }

    $chooseSubpage.placeholder = 
      chrome.i18n.getMessage( $chooseSubpage.dataset.placeholder );
  }
  ,

  /**
   * Add event listeners
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  addEventListeners : function() {
    addEvent(
        document.getElementsByClassName( 'switchPage' )
      , 'click'
      , function( objEvent ) { Options.switchPage( objEvent ); }
    );

    addEvent(
        $chooseSubpage
      , 'change'
      , function( objEvent ) { Options.onChooseSubpageChange( objEvent ); }
    );

    addEvent(
        $chooseSubpage
      , 'keyup'
      , function( objEvent ) { Options.onChooseSubpageChange( objEvent ); }
    );

    addEvent(
        $chooseSubpage
      , 'input'
      , function( objEvent ) { Options.onChooseSubpageChange( objEvent ); }
    );

    addEvent(
        $chooseSubpageForm
      , 'submit'
      , function( objEvent ) {
          Options.chooseSubpage( objEvent );
          return false;
        }
    );

    addEvent(
        $allInputs
      , 'change'
      , function( objEvent ) { Options.onSettingChange( objEvent ); }
    );
  }
  ,

  /**
   * If value equals one of the options, choose that option automatically
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
   onChooseSubpageChange: function( objEvent ) {
    var
        strValue  = $chooseSubpage.value.toLowerCase()
      , $option   = document.querySelector(
          '#chooseSubpageList [data-lowercasevalue="' + strValue + '"]'
        )
      ;

    if ( $option !== null )
      Options.chooseSubpage();
  }
  ,

  /**
   * When choose module form submitted
   *
   * @type    method
   * @param   objEvent
   * @return  void
   **/
  chooseSubpage : function( objEvent ) {
    var
        strValue  = $chooseSubpage.value.toLowerCase()
      , $option   = document.querySelector(
          '#chooseSubpageList [data-lowercasevalue="' + strValue + '"]'
        )
      ;

    if ( $option !== null ) {
      var
          strModuleName   = $option.dataset.module
        , $targetSubpage  = document.getElementById(
                              strModuleSubpageIdPrefix + strModuleName
                            )
        ;

      if ( document.contains( $targetSubpage ) ) {
        for ( var i = 0; i < intSettingsSubpages; i++ )
          $settingsSubpages[ i ].style.display = 'none';

        $targetSubpage.style.display = 'block';

        // Save chosen module for later use
        $chosenSubpage.value = strModuleName;

        // Clear current form value, so the placeholder is visible
        $chooseSubpage.value = '';
      }
    }

    if ( typeof objEvent !== 'undefined' )
      objEvent.preventDefault();
  }
  ,

  /**
   * Display current version on About page
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  displayCurrentVersion : function() {
    document.getElementById( strVersionId ).innerHTML = 
      strConstExtensionVersion;
  }
  ,

  /**
   * Remove all notifications for a module when just disabled it
   *
   * @type    method
   * @param   strModule
   *            Remove notifications of this module
   * @return  void
   **/
  removeModuleNotifications : function( strModule ) {
    StorageLocal.get( 'arrTabsIds', function( objData ) {
      var arrTabsIds = objData.arrTabsIds;

      if ( typeof arrTabsIds === 'undefined' )
        return;

      for ( var i = 0, intTabsIds = arrTabsIds.length; i < intTabsIds; i++ ) {
        var arrTabId = arrTabsIds[ i ];

        if ( arrTabId[ 1 ] === strModule )
          Global.removeNotification( arrTabId[ 0 ], strModule );
      }
    });
  }
};

/* =============================================================================

  2. Listeners

 ============================================================================ */

/**
 * Listens for messages from other pages
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.runtime.onMessage.addListener(
  function( objMessage, objSender, objSendResponse ) {
    if ( objMessage.strReceiver === 'options' ) {
      var objVars = objMessage[ 'objVars' ];

      for ( strProp in objVars ) {
        if ( objVars.hasOwnProperty( strProp ) )
          document.querySelector( '[name="' + strProp + '"]' ).checked = 
            objVars[ strProp ];
      }
    }
  }
);

/* =============================================================================

  3. Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Options.init );