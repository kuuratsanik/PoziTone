/* =============================================================================

  Product                 :           PoziTone
  Author                  :           PoziWorld
  Copyright               :           Copyright (c) 2013-2014 PoziWorld
  License                 :           pozitone.com/license
  File                    :           js/global.js
  Description             :           Global JavaScript

  Table of Contents:

  1. Global
      init()
      getAllCommands()
      setStorageItems()
      showNotification()
      showNotificationCallback()
      showSystemNotification()
      removeNotification()
      saveTabsIds()
      saveActiveButtons()
      saveOpenTabs()
      isValidUrl()
      getValidUrl()
      isEmpty()
      findFirstOpenTabInvokeCallback()
      checkIfModuleIsEnabled()
      getTabIdFromNotificationId()
      composeNotificationId()
      returnIndexOfSubitemContaining()
      addShortcutInfo()
      createTabOrUpdate()
  2. On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  1. Global

 ============================================================================ */

const
    strConstExtensionName           = chrome.i18n.getMessage( 'extensionName' )
  , strConstNotificationIdSeparator = '_'
  , strConstNotificationId          = 
      strConstExtensionName + strConstNotificationIdSeparator
  ;

var Global                        = {
    intNoVolume                   : 0
  , strNotificationIdSeparator    : strConstNotificationIdSeparator
  , strNotificationId             : strConstNotificationId // + module + tab ID
  , strSystemNotificationId       : 
      strConstNotificationId + 'system' + strConstNotificationIdSeparator
  , strNotificationIconUrl        : 'img/notification-icon-80.png'
  , strSystemNotificationIconUrl  : 'img/pozitone-notification-icon-80.png'
  , strNoTrackInfo                : '...'
  , strPlayerIsOffClass           : 'play'
  , strModuleSettingsPrefix       : 'objSettings_'
  , strGeneralSettings            : 'general'

  // Embedded modules (replicates manifest's "content_scripts")
  , objModules                    : {
        ru_101                    : {
            objRegex              : /(http:\/\/|https:\/\/)101.ru\/.*/
          , arrJs                 : [
                'modules/ru_101/js/uppod-player-api.js'
              , 'modules/ru_101/js/uppod-player-api.js'
          ]
        }
      , com_vk_audio              : {
            objRegex              : /(http:\/\/|https:\/\/)vk.com\/.*/
          , arrJs                 : [
                'modules/com_vk_audio/js/page-watcher.js'
          ]
        }
  }

  // Don't show these buttons, if they've been clicked for this track already
  , arrAddTrackToPlaylistFeedback : [
        chrome.i18n.getMessage(
          'notificationAddTrackToPlaylistFeedbackSuccessfullyAdded'
        )
      , chrome.i18n.getMessage(
          'notificationAddTrackToPlaylistFeedbackAlreadyInPlaylist'
        )
    ]
  , strFavoriteStatusSuccess      : 
      chrome.i18n.getMessage( 'notificationFavoriteStatusSuccess' )

  , arrCommands                   : []
  , boolShowShortcuts             : true

  , objNotificationButtons        : {
        add                       : {
            loggedIn              : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsAddLoggedInTitle'
                      )
                  , iconUrl       : 'img/round_plus_icon&16.png'
                }
              , strFunction       : 'add'
            }
        }
      , favorite                  : {
            loggedIn              : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsFavoriteLoggedInTitle'
                      )
                  , iconUrl       : 'img/emotion_smile_icon&16.png'
                }
              , strFunction       : 'favorite'
            }
        }
      , next                      : {
            next                  : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsNextTitle'
                      )
                  , iconUrl       : 'img/playback_next_icon&16.png'
                }
              , strFunction       : 'next'
            }
        }
      , previous                  : {
            previous              : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsPreviousTitle'
                      )
                  , iconUrl       : 'img/playback_prev_icon&16.png'
                }
              , strFunction       : 'previous'
            }
        }
      , playStop                  : {
            play                  : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsPlayTitle'
                      )
                  , iconUrl       : 'img/playback_play_icon&16.png'
                }
              , strFunction       : 'playStop'
            }
          , stop                  : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsStopTitle'
                      )
                  , iconUrl       : 'img/playback_stop_icon&16.png'
                }
              , strFunction       : 'playStop'
            }
        }
      , muteUnmute                : {
            mute                  : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsMuteTitle'
                      )
                  , iconUrl       : 'img/sound_mute_icon&16.png'
                }
              , strFunction       : 'mute'
            }
          , unmute                : {
                objButton         : {
                    title         : 
                      chrome.i18n.getMessage(
                        'notificationButtonsUnmuteTitle'
                      )
                  , iconUrl       : 'img/sound_high_icon&16.png'
                }
              , strFunction       : 'unmute'
            }
        }
    }
  ,

  /**
   * Things to do on initialization.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Global.getAllCommands();
  }
  ,

  /**
   * Gets all the registered extension commands and their shortcut (if active).
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getAllCommands : function() {
    // TODO: 1 var
    var strVarToGet = 
          Global.strModuleSettingsPrefix + Global.strGeneralSettings;

    chrome.storage.sync.get( strVarToGet, function( objReturn ) {
      if ( typeof strLog === 'string' ) {
        strLog = 'getAllCommands';
        Log.add( strLog, objReturn );
      }

      var objGeneralSettings  = objReturn[ strVarToGet ];

      if (
            typeof objGeneralSettings === 'object'
        &&  objGeneralSettings.boolShowShortcutsInNotification
      ) {
        Global.boolShowShortcuts = true;

        chrome.commands.getAll( function( arrCommands ) {
          Global.arrCommands = arrCommands;
        } );
      }
      else
        Global.boolShowShortcuts = false;
    });
  }
  ,

  /**
   * Sets multiple items in StorageArea.
   *
   * @type    method
   * @param   objItems
   *            An object which gives each key/val pair to update storage with.
   * @param   strLog
   *            Debug line "prefix".
   * @return  void
   **/
  setStorageItems : function( objItems, strLog ) {
    chrome.storage.sync.set( objItems, function() {
      var strSetStorageItemsLog = strLog;
      Log.add( strLog + strLogDo, objItems );

      if ( chrome.runtime.lastError ) {
        Log.add( strLog + strLogError, {}, true );
        return;
      }

      chrome.storage.sync.get( null, function( objAllItemsAfterUpdate ) {
        Log.add( strSetStorageItemsLog + strLogDone, objAllItemsAfterUpdate );
      });
    });
  }
  ,

  /**
   * Displays current track info via Notification.
   *
   * @type    method
   * @param   boolIsUserLoggedIn
   *            Whether user logged-in or not
   * @param   boolDisregardSameMessage
   *            If true, show notification in any case
   * @param   intTabId
   *            Tab ID info received from
   * @param   objPlayerInfo
   *            Player info (play status, volume, etc.)
   * @param   objStationInfo
   *            Station info
   *              (strStationName, strStationNamePlusDesc, strTrackInfo)
   * @param   strCommand
   *            Optional. Which command made this call
   * @return  void
   **/
  showNotification : function(
      boolIsUserLoggedIn
    , boolDisregardSameMessage
    , intTabId
    , objPlayerInfo
    , objStationInfo
    , strCommand
  ) {
    strLog = 'showNotification';
    Log.add( strLog, objStationInfo );

    var
        objNotificationOptions  = {
            type                : 'basic'
          , title               : ''
          , message             : objStationInfo.strTrackInfo
          , iconUrl             : Global.strNotificationIconUrl
        }
      , objTempPlayerInfo       = objPlayerInfo
      , objTempStationInfo      = objStationInfo
      , strModule               = objTempPlayerInfo.strModule
      , strStorageVar           = Global.strModuleSettingsPrefix + strModule
      , strNotificationId       = Global.composeNotificationId(
                                      strModule
                                    , intTabId
                                  )
      ;

    // Clear notification for this tab first, then display a new one
    chrome.notifications.clear( strNotificationId, function() {
      chrome.storage.sync.get(
          strStorageVar
        , function( objReturn ) {
            var objData = objReturn[ strStorageVar ];

            // Whether to show notification or not
            if (
                  ! boolDisregardSameMessage
              &&  typeof
                    objData.boolShowNotificationWhenStopped !== 'undefined'
              &&  ! objData.boolShowNotificationWhenStopped
              &&  objTempPlayerInfo.strStatus === Global.strPlayerIsOffClass
            )
              return false;

            if (
                  ! boolDisregardSameMessage
              &&  typeof
                    objData.boolShowNotificationWhenMuted !== 'undefined'
              &&  ! objData.boolShowNotificationWhenMuted
              &&  objTempPlayerInfo.intVolume === Global.intNoVolume
            )
              return false;

            if (
                  ! boolDisregardSameMessage
              &&  typeof 
                    objData.boolShowNotificationWhenNoTrackInfo !== 'undefined'
              &&  ! objData.boolShowNotificationWhenNoTrackInfo
              &&  objTempStationInfo.strTrackInfo === Global.strNoTrackInfo
            )
              return false;

            // Notification Icon Settings
            if (
                  objData.boolShowNotificationLogo
              &&  objStationInfo.strLogoDataUri !== null
            )
              objNotificationOptions.iconUrl = objStationInfo.strLogoDataUri;

            var
                strTitleFormat = objData.strNotificationTitleFormat || ''
              , arrButtons     = objData.arrNotificationButtons
              ;

            // Notification Title Settings
            if ( strTitleFormat === 'short' )
              objNotificationOptions.title = 
                objTempStationInfo.strStationName;
            else if ( strTitleFormat === 'long' )
              objNotificationOptions.title = 
                objTempStationInfo.strStationNamePlusDesc;
            else if ( strTitleFormat === 'noStationInfo' )
              objNotificationOptions.title = 
                chrome.i18n.getMessage( 'extensionName' );

            // Notification Buttons Settings
            if ( arrButtons.length !== 0 ) {
              // Save active buttons for the listener
              var
                  arrActiveButtons        = []
                , objNotificationButtons  = Global.objNotificationButtons
                , arrTrackInfo            = objTempStationInfo
                                              .strTrackInfo.split( "\n\n" )
                ;

              objNotificationOptions.buttons = [];

              // TODO: Combine all following buttons check into one

              if (
                    arrButtons.indexOf( 'add' ) !== -1
                &&  (
                          boolIsUserLoggedIn
                      &&  (
                                typeof
                                  objTempStationInfo
                                    .boolHasAddToPlaylistButton ===
                                      'undefined'
                            ||  objTempStationInfo.boolHasAddToPlaylistButton
                          )
                    )
              ) {
                // Don't show button, if track is in playlist
                // TODO: Show if track changed while waited for server response
                if (
                  Global
                    .arrAddTrackToPlaylistFeedback
                      .indexOf( arrTrackInfo[ 1 ] ) === -1
                ) {
                  objNotificationOptions.buttons.push(
                    Global.addShortcutInfo(
                        objNotificationButtons.add.loggedIn.objButton
                      , 'add'
                    )
                  );

                  arrActiveButtons.push( 'add|loggedIn' );
                }
              }

              if (
                    arrButtons.indexOf( 'favorite' ) !== -1
                &&  boolIsUserLoggedIn
              ) {
                // Don't show button, if liked this track already
                // TODO: Show if track changed while waited for server response
                if (
                  Global
                    .strFavoriteStatusSuccess
                      .indexOf( arrTrackInfo[ 1 ] ) === -1
                ) {
                  objNotificationOptions.buttons.push(
                    Global.addShortcutInfo(
                        objNotificationButtons.favorite.loggedIn.objButton
                      , 'favorite'
                    )
                  );

                  arrActiveButtons.push( 'favorite|loggedIn' );
                }
              }

              if (
                    arrButtons.indexOf( 'next' ) !== -1
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayNextTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo
                                  .boolCanPlayNextTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.next.next.objButton
                    , 'next'
                  )
                );

                arrActiveButtons.push( 'next|next' );
              }

              if (
                    arrButtons.indexOf( 'previous' ) !== -1
                &&  (
                          boolIsUserLoggedIn
                      ||  (
                                typeof
                                  objTempPlayerInfo
                                    .boolCanPlayPreviousTrackLoggedOut ===
                                      'undefined'
                            ||  objTempPlayerInfo
                                  .boolCanPlayPreviousTrackLoggedOut
                          )
                    )
              ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons.previous.previous.objButton
                    , 'previous'
                  )
                );

                arrActiveButtons.push( 'previous|previous' );
              }

              if ( arrButtons.indexOf( 'playStop' ) !== -1 ) {
                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons
                        .playStop[ objTempPlayerInfo.strStatus ]
                          .objButton
                    , 'playStop'
                  )
                );

                arrActiveButtons
                  .push( 'playStop|' + objTempPlayerInfo.strStatus );
              }

              if ( arrButtons.indexOf( 'muteUnmute' ) !== -1 ) {
                var strMuteUnmuteState  = ( objTempPlayerInfo.intVolume > 0 ) ? 
                                            'mute' : 'unmute';

                objNotificationOptions.buttons.push(
                  Global.addShortcutInfo(
                      objNotificationButtons
                        .muteUnmute[ strMuteUnmuteState ]
                          .objButton
                    , 'muteUnmute'
                  )
                );

                arrActiveButtons.push( 'muteUnmute|' + strMuteUnmuteState );
              }
            }

            chrome.notifications.create( 
                strNotificationId
              , objNotificationOptions
              , function( strNotificationId ) {
                  Global.showNotificationCallback(
                      objTempPlayerInfo
                    , objTempStationInfo
                    , intTabId
                    , arrActiveButtons
                    , strCommand
                  );
                }
            );
          }
      );
    });
  }
  ,

  /**
   * Actions after notification has been displayed.
   *
   * @type    method
   * @param   objPlayerInfo
   *            Play status, volume, etc.
   * @param   objStationInfo
   *            Last Track + Station info
   * @param   intTabId
   *            Tab ID info received from
   * @param   arrActiveButtons
   *            Active buttons for current notification
   * @param   strCommand
   *            Optional. Which command made this call
   * @return  void
   **/
  showNotificationCallback : function(
      objPlayerInfo
    , objStationInfo
    , intTabId
    , arrActiveButtons
    , strCommand
  ) {
    var strModule = objPlayerInfo.strModule;

    /* START Log */
    var
        arrTrackInfo  = objStationInfo.strTrackInfo.split( "\n\n" )
      , funcLog       = function() {
          strLog = 'showNotificationCallback';
          Log.add(
              strLog
            , {
                  strModule                   : strModule
                , strStationName              : objStationInfo.strStationName
                , boolHasAddToPlaylistButton  : 
                    objStationInfo.boolHasAddToPlaylistButton || 'n/a'
              }
            , true
          );
        }
      ;

    // There is no arrTrackInfo[ 1 ] only on track change (automatic and when
    // clicked 'next', too) and on 'showNotification' command
    if (
          typeof arrTrackInfo[ 1 ] === 'undefined'
      &&  strCommand !== 'showNotification'
    )
      funcLog();
    else
      chrome.storage.sync.get( 'arrRecentTracks', function( objReturn ) {
        if ( typeof objReturn.arrRecentTracks === 'object' ) {
          var arrLastTrack = objReturn.arrRecentTracks.pop();

          // Don't log when same player, station & track info as last track. 
          // Even on page reload.
          if (
                (
                      arrLastTrack      === undefined
                  ||  arrLastTrack[ 0 ] !== arrTrackInfo[ 0 ]
                  ||  arrLastTrack[ 1 ] !== objStationInfo.strStationName
                  ||  arrLastTrack[ 2 ] !== objStationInfo.strLogoUrl
                )
            &&  strCommand !== 'showNotification'
          )
            funcLog();
        }
      });
    /* END Log */

    Background.saveRecentTrackInfo( objStationInfo ); 
    Global.saveTabsIds( intTabId, strModule );
    Global.saveActiveButtons( intTabId, arrActiveButtons );
  }
  ,

  /**
   * Displays system notification.
   *
   * @type    method
   * @param   strNotificationType
   *            Type of the notification
   * @param   strTitle
   *            Optional. Title of the notification
   * @param   strMessage
   *            Optional. Message of the notification
   * @param   strIconUrl
   *            Optional. URL of the notification icon
   * @param   arrButtons
   *            Optional. Buttons of the notification
   * @return  void
   **/
  showSystemNotification : function(
      strNotificationType
    , strTitle
    , strMessage
    , strIconUrl
    , arrButtons
  ) {
    strLog = 'showSystemNotification';
    Log.add( strLog, strTitle + ' | ' + strMessage );

    var
        objNotificationOptions  = {
            type                : 'basic'
          , title               : strTitle || ''
          , message             : strMessage || ''
          , iconUrl             : 
              strIconUrl || Global.strSystemNotificationIconUrl
        }
      , strNotificationId       = 
          Global.strSystemNotificationId + strNotificationType
      ;

    if ( Array.isArray( arrButtons ) && arrButtons.length )
      objNotificationOptions.buttons = arrButtons;

    // Clear previous notification of this type first, then display a new one
    chrome.notifications.clear( strNotificationId, function() {
      chrome.notifications.create(
          strNotificationId
        , objNotificationOptions
        , function( strNotificationId ) {}
      );
    });
  }
  ,

  /**
   * Removes the notification for this tab.
   *
   * @type    method
   * @param   intTabId
   *            ID of the tab
   * @param   strModule
   *            Module notification was displayed for
   * @return  void
   **/
  removeNotification : function( intTabId, strModule ) {
    var funcRemoveNotification = function( intTabId, strModule ) {
      chrome.notifications.clear(
          Global.composeNotificationId( strModule, intTabId )
        , function( boolWasCleared ) {
            strLog = 'removeNotification';
            Log.add( strLog, intTabId );

            if ( boolWasCleared ) {
              var arrVars = [ 'objActiveButtons', 'arrTabsIds' ];

              chrome.storage.sync.get( arrVars, function( objData ) {
                strLog = 'removeNotification';
                var intChanges = 0;

                // Remove this notification's active buttons
                if ( typeof objData.objActiveButtons[ intTabId ] === 'object' ) {
                  delete objData.objActiveButtons[ intTabId ];
                  intChanges++;
                }

                // Remove this notification's tab id
                var
                    arrTabsIds  = objData.arrTabsIds
                  , intIndex    = Global.returnIndexOfSubitemContaining(
                                      arrTabsIds
                                    , intTabId
                                  )
                  ;

                if ( intIndex !== -1 ) {
                  arrTabsIds.splice( intIndex, 1 );
                  intChanges++;
                }

                // "Submit" changes
                if ( intChanges > 0 )
                  Global.setStorageItems( objData, strLog + ', submit' );
              });
            }
        }
      );
    }

    if ( typeof strModule === 'undefined' ) {
      chrome.storage.sync.get( 'arrTabsIds', function( objData ) {
        strLog = 'removeNotification, strModule';
        Log.add( strLog, intTabId );

        var arrTabsIds = objData.arrTabsIds;

        if ( typeof arrTabsIds === 'undefined' )
          return;

        var intIndex = 
              Global.returnIndexOfSubitemContaining( arrTabsIds, intTabId );

        if ( intIndex !== -1 ) {
          strModule = arrTabsIds[ intIndex ][ 1 ];
          funcRemoveNotification( intTabId, strModule );
        }
      });
    }
    else
      funcRemoveNotification( intTabId, strModule );
  }
  ,

  /**
   * Saves tab id, for which notification was shown, in storage for later use.
   * 
   * TODO: Use obj instead of arr?
   *
   * @type    method
   * @param   intTabId
   *            Tab ID info received from
   * @param   strModule
   *            Module notification was displayed for
   * @return  void
   **/
  saveTabsIds : function ( intTabId, strModule ) {
    chrome.storage.sync.get( 'arrTabsIds', function( objData ) {
      strLog = 'saveTabsIds';
      Log.add( strLog, intTabId );

      var arrTabsIds = objData.arrTabsIds;

      if ( typeof arrTabsIds === 'undefined' )
        arrTabsIds = [];

      var
          intIndex      = Global.returnIndexOfSubitemContaining(
                              arrTabsIds
                            , intTabId
                          )
        , intLastIndex  = arrTabsIds.length - 1
        , intChanges    = 0
        , arrToPush     = [ intTabId, strModule ]
        , funcPush      = function() {
                            arrTabsIds.push( arrToPush );
                            intChanges++;
                          }
        ;

      // Save if it is not present or "reposition" to be the last
      if ( intIndex === -1 )
        funcPush();
      else if ( intIndex !== intLastIndex ) {
        arrTabsIds.splice( intIndex, 1 );
        funcPush();
      }

      // "Submit" changes
      if ( intChanges > 0 )
        Global.setStorageItems( objData, strLog );
    });
  }
  ,

  /**
   * Saves active buttons (per notification's tab id) in storage for later use.
   *
   * @type    method
   * @param   intTabId
   *            Tab ID info received from
   * @param   arrActiveButtons
   *            Active buttons for current notification
   * @return  void
   **/
  saveActiveButtons : function ( intTabId, arrActiveButtons ) {
    chrome.storage.sync.get( 'objActiveButtons', function( objData ) {
      strLog = 'saveActiveButtons';
      Log.add(
          strLog
        , {
              intTabId          : intTabId
            , arrActiveButtons  : arrActiveButtons
          }
      );

      if ( typeof objData.objActiveButtons === 'undefined' )
        objData.objActiveButtons = {};

      if (
            typeof objData.objActiveButtons[ intTabId ] === 'undefined'
        ||  JSON.stringify( objData.objActiveButtons[ intTabId ] ) !== 
              JSON.stringify( arrActiveButtons )
      ) {
        objData.objActiveButtons[ intTabId ] = arrActiveButtons;

        Global.setStorageItems( objData, strLog );
      }
    });
  }
  ,

  /**
   * Saves open tabs objects for later use.
   *
   * @type    method
   * @param   objOpenTabs
   *            Object of open tabs
   * @return  void
   **/
  saveOpenTabs : function ( objOpenTabs ) {
    strLog = 'saveOpenTabs';
    Log.add( strLog, objOpenTabs );

    var objToSet = {};

    objToSet.objOpenTabs = {};

    for ( var intWindowId in objOpenTabs ) {
      if ( objOpenTabs.hasOwnProperty( intWindowId ) ) {
        // If there are no open tabs for this windowId saved yet
        if ( Global.isEmpty( objToSet.objOpenTabs[ intWindowId ] ) )
          objToSet.objOpenTabs[ intWindowId ] = {};

        var objTempWindowTabs = objOpenTabs[ intWindowId ];

        for ( var intTabIndex in objTempWindowTabs ) {
          if ( objTempWindowTabs.hasOwnProperty( intTabIndex ) ) {
            objToSet.objOpenTabs[ intWindowId ][ intTabIndex ] = 
              objTempWindowTabs[ intTabIndex ];
          }
        }
      }
    }

    chrome.storage.sync.get( 'objOpenTabs', function( objReturn ) {
      if (
        ! (
              Global.isEmpty( objToSet.objOpenTabs )
          &&  Global.isEmpty( objReturn.objOpenTabs )
        )
      ) {
        strLog = 'saveOpenTabs';

        Global.setStorageItems( objToSet, strLog );
      }
    });
  }
  ,

  /**
   * Checks whether the URL is supported.
   *
   * @type    method
   * @param   strUrl
   *            Provided URL
   * @return  void
   **/
  isValidUrl : function ( strUrl ) {
    var
        objModules  = this.objModules
      ;

    for ( var strModule in objModules ) {
      if ( objModules.hasOwnProperty( strModule ) ) {
        var objRegEx = objModules[ strModule ].objRegex;

        if ( objRegEx.test( strUrl ) )
          return strModule;
        }
    }

    return false;
  }
  ,

  /**
   * Gets valid URL.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  string
   **/
  getValidUrl : function ()
  {
    return this.strValidUrl;
  }
  ,

  /**
   * Checks whether object/array is empty.
   *
   * @type    method
   * @param   objToTest
   *            Object to check against
   * @return  bool
   **/
  isEmpty : function ( objToTest )
  {
    for ( var i in objToTest )
      return false;

    return true;
  }
  ,

  /**
   * Makes an object out of an array
   *
   * @type    method
   * @param   arrToConvert
   *            Array to convert
   * @return  object
   **/
  convertArrToObj : function ( arrToConvert )
  {
    return obj = arrToConvert.reduce(
        function( o, v, i ) {
          o[ i ] = v;
          return o;
        }
      , {}
    );
  }
  ,

  /**
   * Finds first open tab and invoke callback.
   * funcCallback() should return 0 to continue search for the right tab.
   *
   * @type    method
   * @param   funcCallback
   *            Callback to invoke when open tab found
   * @return  bool
   **/
  findFirstOpenTabInvokeCallback : function ( funcCallback )
  {
    chrome.storage.sync.get( 'objOpenTabs', function( objReturn ) {
      strLog = 'findFirstOpenTabInvokeCallback';
      Log.add( strLog );

      var objOpenTabs = objReturn.objOpenTabs;

      for ( var intWindowId in objOpenTabs ) {
        if ( objOpenTabs.hasOwnProperty( intWindowId ) ) {
          var objTempWindowTabs = objOpenTabs[ intWindowId ];

          for ( var intTabIndex in objTempWindowTabs ) {
            if ( objTempWindowTabs.hasOwnProperty( intTabIndex ) ) {
              
              if ( funcCallback(
                    parseInt( intWindowId )
                  , parseInt( intTabIndex )
                  , objTempWindowTabs[ intTabIndex ].id
                  , objTempWindowTabs[ intTabIndex ].url
                ) !== 0 )
                return;
            }
          }
        }
      }
    });
  }
  ,

  /**
   * Checks whether a module is enabled.
   *
   * @type    method
   * @param   strNotificationId
   *            Notification ID
   * @return  integer
   **/
  checkIfModuleIsEnabled : function (
      strModule
    , intTabId
    , funcSuccess
    , funcElse
    , objPreservedData
    , strFrom
  ) {
    var strObjSettings = Global.strModuleSettingsPrefix + strModule;

    chrome.storage.sync.get(
        strObjSettings
      , function( objReturn ) {
          var objModuleSettings = objReturn[ strObjSettings ];

          if (
                typeof objModuleSettings === 'object'
            &&  objModuleSettings.boolIsEnabled
          ) {
            strLog = 'checkIfModuleIsEnabled, ' + strFrom;
            Log.add( strLog + strLogSuccess, intTabId );

            funcSuccess( objPreservedData );
          }
          else
            funcElse( objPreservedData );
        }
    );
  }
  ,

  /**
   * Extracts tab ID from notification id.
   *
   * @type    method
   * @param   strNotificationId
   *            Notification ID
   * @return  integer
   **/
  getTabIdFromNotificationId : function ( strNotificationId )
  {
    var
        arrNotificationId     = strNotificationId.split(
                                  Global.strNotificationIdSeparator
                                )
      , intNotificationIdLen  = arrNotificationId.length
      , intNotificationTabId  = parseInt(
                                  arrNotificationId[ intNotificationIdLen - 1 ]
                                )
      ;

    return intNotificationTabId;
  }
  ,

  /**
   * Composes notification ID.
   *
   * @type    method
   * @param   intTabId
   *            Tab ID notification belongs to
   * @param   strModule
   *            Module notification was displayed for
   * @return  string
   **/
  composeNotificationId : function ( strModule, intTabId )
  {
    return Global.strNotificationId + 
            strModule + 
            Global.strNotificationIdSeparator + 
            intTabId;
  }
  ,

  /**
   * Finds item in subarray, returns its index.
   *
   * @type    method
   * @param   arrContainer
   *            Array containing arrays/objects
   * @param   miscItem
   *            What to look for
   * @param   miscProp
   *            Array index or object key
   * @return  integer
   **/
  returnIndexOfSubitemContaining : function ( arrContainer, miscItem, miscProp )
  {
    return arrContainer
            .map(
              function ( miscSub ) {
                miscProp = ( typeof miscProp === 'undefined' ) ? 0 : miscProp;

                return miscSub[ miscProp ]
              }
            )
              .indexOf( miscItem );
  }
  ,

  /**
   * Adds shortcut info to the title of the button
   *
   * @type    method
   * @param   objButton
   *            Button properties
   * @return  object
   **/
  addShortcutInfo : function ( objButton, strCommand )
  {
    if ( Global.boolShowShortcuts ) {
      // We need a copy, otherwise it will append info again and again
      var objButtonCopy   = ( typeof objButton === 'object' ) ?
                              JSON.parse( JSON.stringify( objButton ) ) : {};

      if ( typeof objButtonCopy.title === 'string' ) {
        var intCommandsIndex  = Global.returnIndexOfSubitemContaining(
                                    Global.arrCommands
                                  , strCommand
                                  , 'name'
                                );

        if ( intCommandsIndex !== -1 ) {
          var strShortcut = Global.arrCommands[ intCommandsIndex ].shortcut;

          if ( strShortcut !== '' )
            objButtonCopy.title += ' (' + strShortcut + ')';
        }
      }

      return objButtonCopy;
    }
    else
      return objButton;
  }
  ,

  /**
   * Creates tab if it is not open or makes it active
   *
   * @type    method
   * @param   strUrl
   *            URL to open
   * @return  void
   **/
  createTabOrUpdate : function ( strUrl )
  {
    if ( typeof strLog === 'string' ) {
      strLog = 'createTabOrUpdate';
      Log.add( strLog, strUrl );
    }

    var objUrl = { url: strUrl };

    chrome.tabs.query( objUrl, function( objTabs ) {
      if ( objTabs.length )
        chrome.tabs.update( objTabs[0].id, { active: true } );
      else
        chrome.tabs.create( objUrl );
    } );
  }
};

/* =============================================================================

  2. On Load

 ============================================================================ */

/**
 * Initializes.
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Global.init();