var BrowserCombat = ( function() {
        
    var BrowserCombat = function( debug ) {
        this.detectBrowser( debug );
    };
    
    BrowserCombat.prototype = {
        
        debug: false,
        
        status: null,
        
        current: {
        
            browser: '',
            version: '',
            key: 0
            
        },
        
        constructor: BrowserCombat,
        
        detectBrowser: function( debug )
        {
            
            var n = navigator.appName, ua = navigator.userAgent, tem;
            var m = ua.match( /(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i );
            if( m && ( tem= ua.match( /version\/([\.\d]+)/i ) ) != null ) m[2] = tem[1];
            m = m? [m[1], m[2]]: [n, navigator.appVersion, '-?' ];
        
            this.current.browser = m[0].toLowerCase();
            
            var version = m[1];
            
            if (this.current.browser === 'chrome') {
                var chrome_version = ''
                var n = m[1].split('.');
                for (var i = 0; i < 3; i++) {
                    chrome_version += n[i] + '.';
                }
                version = chrome_version.substr( 0, chrome_version.length - 1);
            }
            
            this.current.version = version;
            
            if (this.browsers[this.current.browser] !== undefined) {
            
                for (var v = 0; v < this.browsers[this.current.browser].length; v++) {
                    if (this.current.version === this.browsers[this.current.browser][v]) {
                        this.current.key = v;
                        break;
                    }
                }
            
            }
            
            if (debug === undefined) {
                debug = false;
            }
            
            this.debug = debug;
            
            if (debug) {
                
                //console.info( 'Browser: ' + this.current.browser );
                //console.info( 'Version: ' + this.current.version);
                //console.info( 'Key: ' + this.current.key );
                
            }
            
        },
        
        set: function( params )
        {
                        
            if (this.inArray( this.current.browser, this.browsers )) {
            
                for (var i = 0; i < params.browsers.length; i++) {
                    
                    // var check_key = this.browsers[browser].length + 1;
                    var check_key = -1; // Key is set by Users Browser Versions position
                    var browser   = params.browsers[i].browser.toLowerCase();
                                                              
                    if (this.current.browser === browser) {
                        
                        if (params.browsers[i].version === 'all') {
                        
                            this.status = 'passed';
                            if (typeof params.callback === 'function') {
                                return params.callback( 'passed' );
                            }
                            break;
                            
                        }
                        else if( params.browsers[i].version === 'none' ) {
                            
                            this.status = 'failed';
                            if (typeof params.callback === 'function') {
                                return params.callback( 'failed' );
                            }
                            break;
                            
                        }
                        
                        for (var v = 0; v < this.browsers[browser].length; v++) {
                            
                            if (this.browsers[''+browser+''][v] == params.browsers[i].version) {
                                check_key = v;
                                break;
                            } 
                        }
                        
                        if (check_key === -1) {
                            
                            this.status = 'version_not_found';
                            if (typeof params.callback === 'function') {
                                return params.callback( 'version_not_found' );
                            }
                             
                        }
                        
                        if (check_key <= this.current.key) {
                        
                            this.status = 'passed';
                            if (typeof params.callback === 'function') {
                                return params.callback( 'passed' );
                            }
                            
                        }
                        else {
                        
                            this.status = 'failed';
                            if (typeof params.callback === 'function') {
                                return params.callback( 'failed' );
                            }
                            
                        }
                                            
                        break;
                        
                    }
                    
                }
                
                if (check_key === -1) {
                            
                    this.status = 'version_not_found';
                    if (typeof params.callback === 'function') {
                        return params.callback( 'version_not_found' );
                    }
                     
                }
            
            }
            else {
                
                this.status = 'browser_not_found';
                if (typeof params.callback === 'function') {
                    return params.callback( 'browser_not_found' );
                }
                
            }
            
        },
        
        get: function( type )
        {
            
            switch (type) {
                
                case 'all':
                
                    this.current.status = this.status;
                    if (this.debug) {
                        //console.info( this.current );
                    }
                    return this.current;
                    break;
                
                case 'browser':
                
                    if (this.debug) {
                        //console.info( this.current.browser );
                    }
                    return this.current.browser;
                    break
                
                case 'version':
                    
                    if (this.debug) {
                        //console.info( this.current.version );
                    }
                    return this.current.version;
                    break;
                    
                case 'status':
                
                    if (this.debug) {
                        //console.info( this.status );
                    }
                    return this.status;
                    break;
                    
                default:
                
                    if (this.debug) {
                        //console.info( 'get_not_set' );
                    }
                    return false;
                    break;
                
            }
            
        },
        
        onSuccess: function( callback )
        {
            if (this.status === 'passed' 
                || this.status === 'browser_not_found'
                    || this.status === 'version_not_found' ) {
                    
                return callback( this.status );
            }
        },
        
        onFailure: function( callback )
        {
            if (this.status === 'failed' 
                || this.status === 'browser_not_found'
                    || this.status === 'version_not_found' ) {
                    
                return callback( this.status );
            }
        },
        
        inArray: function( key, array )
        {
            for (version in array) {
                if (key === version) {
                    return true;
                }   
            }
            return false;
        },
        
        browsers: {
        
            'firefox': [
            
                '0.8','0.9','0.9.1','0.9.2','0.9.3','0.10','0.10.1','1.0.1','1.0.2','1.0.3',
                '1.0.4', '1.0.5', '1.0.6','1.0.7','1.0.8','1.5.0.1','1.5.0.2','1.5.0.3','1.5.0.4',
                '1.5.0.5','1.5.0.6','1.5.0.7','1.5.0.8','1.5.0.9','1.5.0.10','1.5.0.11','1.5.0.12',
                '2.0.0.1','2.0.0.2','2.0.0.3','2.0.0.4','2.0.0.5','2.0.0.6','2.0.0.7','2.0.0.8','2.0.0.9',
                '2.0.0.10','2.0.0.11','2.0.0.12','2.0.0.13','2.0.0.14','2.0.0.15','2.0.0.16','2.0.0.17','2.0.0.18',
                '2.0.0.19','2.0.0.20','3.0.1','3.0.2','3.0.3','3.0.4','3.0.5','3.0.6','3.0.7','3.0.8','3.0.9',
                '3.0.10','3.0.11','3.0.12','3.0.13','3.0.14','3.0.15','3.0.16','3.0.17','3.0.18','3.0.19',
                '3.5.1','3.5.2','3.5.3','3.5.4','3.5.5','3.5.6','3.5.7','3.5.8','3.5.9','3.5.10','3.5.11',
                '3.5.12','3.5.13','3.5.14','3.5.15','3.5.16','3.5.17','3.5.18','3.5.19','3.6.2','3.6.3',
                '3.6.4','3.6.5','3.6.6','3.6.7','3.6.8','3.6.9','3.6.10','3.6.11','3.6.12','3.6.13','3.6.14',
                '3.6.15','3.6.16','3.6.17','3.6.18','3.6.19','3.6.20','3.6.21','3.6.22','3.6.23','3.6.24',
                '3.6.25','3.6.26','3.6.27','3.6.28','4.0.1','5.0','5.0.1','6.0','6.0.1','6.0.2','7.0',
                '7.0.1','8.0','8.0.1','9.0','9.0.1','10.0','10.0.1','10.0.2','10.0.3','10.0.4','10.0.5',
                '10.0.6','10.0.7','10.0.8','10.0.9','10.0.10','10.0.11','10.0.12','12.0','13.0','13.0.1','14.0',
                '14.0.1','15.0','15.0.1','16.0','16.0.1','16.0.2','17.0','17.0.1','17.0.2','17.0.3','17.0.4',
                '17.0.5','18.0.1','18.0.2','19.0','19.0.1','19.0.2','20.0','20.0.1'
                
            ],
            
            'chrome': [
            
                '0.2.149','0.3.154','0.4.154','1.0.154','2.0.172','3.0.195','4.0.249','4.1.249','5.0.375',
                '6.0.472','7.0.517','8.0.552','9.0.597','10.0.648','11.0.696','12.0.724','13.0.782','14.0.835',
                '15.0.874','16.0.912','17.0.963','18.0.1025','19.0.1084','20.0.1132','21.0.1180','22.0.1229',
                '23.0.1271','24.0.1312','25.0.1364','26.0.1410','27.0.1453','28.0.1500'
                
            ],
            
            'safari': [
            
                '0.8','0.9','1.0','1.0.3','1.1.','1.2','1.3','1.3.1','1.3.2','2.0','2.0.2','2.0.4','3.0',
                '3.0.2','3.0.3','3.0.4','3.1','3.1.1','3.1.2','3.2','3.2.1','3.2.3','4.0','4.0.1','4.0.2',
                '4.0.3','4.0.4','4.0.5','4.1','4.1.1','4.1.2','4.1.3','5.0','5.0.1','5.0.2','5.0.3','5.0.4',
                '5.0.5','5.0.6','5.1','5.1.1','5.1.2','5.1.3','5.1.4','5.1.5','5.1.6','5.1.7','5.1.8',
                '5.1.9','6.0','6.0.1','6.0.2','6.0.3','6.0.4'
                
            ],
            
            'msie':[
                
                '2.0','3.0','3.0B','3.01','3.02','3.03','4.0','4.01','4.5','5.0','5.00','5.0b1','5.01','5.05',
                '5.12','5.13','5.14','5.15','5.16','5.17','5.2','5.21','5.22','5.22','5.23','5.5','5.50','5.5b1',
                '6.0','6.0b','6.01','6.1','7.0','7.0b','8.0','9.0','10.0','10.6'
                
            ],
            
            'opera': [
                '12.14','12.02','12.00','11.62','11.52','11.51','11.50','11.11','11.10','11.01','11.00','10.70',
                '10.63','10.62','10.61','10.60','10.54','10.53','10.52','10.51','10.50','10.10','10.01','10.00',
                '9.99','9.80','9.70','9.64','9.63','9.62','9.61','9.60','9.52','9.51','9.50','9.4','9.30','9.27',
                '9.26','9.25','9.24','9.23','9.22','9.21','9.20','9.12','9.10','9.02','9.01','9.00','8.65','8.60',
                '8.54','8.53','8.52','8.51','8.50','8.10','8.02','8.01','8.00','7.60','7.54u1','7.54','7.53',
                '7.52','7.51','7.50','7.23','7.22','7.21','7.20','7.11','7.10','7.03','7.02','7.01','7.0','6.12',
                '6.11','6.1','6.06','6.05','6.04','6.03','6.02','6.01','6.0','5.12','5.11','5.02','5.0','4.02'
            ].reverse()
            
        }
        
    };
    
    return BrowserCombat;
    
} )( );