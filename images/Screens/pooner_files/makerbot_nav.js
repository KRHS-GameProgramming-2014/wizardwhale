var MakerBotNav = ( function(env, user) 
{
    
    var MakerBotNav = function(env, user) 
    {
        this.initialize(env, user);
    };
    
    var self;
    var last_positions = [];
    var mouse_leave_timer;
    var environment;
    var ext_nav;
    var is_logged_in = false;
    var avatar; 
    
    var navigation = 
    {
        "products": {
            x: '100%',
            y: 400,
            type: 'full'
        },
        "news": {
            x: 300,
            y: 115,
            type: 'fixed'
        },
        "explore": {
            x: 300,
            y: 190,
            type: 'fixed'
        },
        "community": {
            x: 300,
            y: 155,
            type: 'fixed'
        },
        "stores": {
            x: 300,
            y: 76,
            type: 'fixed'
        },
        "support": {
            type: 'clear'
        }
        
    };
    
    MakerBotNav.prototype = {
        
        constructor: MakerBotNav,
        
        initialize: function(env, user)
        {
            self = this;
            environment = env;
            self.eventListeners();
            
            if (user == '1') {
                is_logged_in = true;
            }
            
            avatar = $('#nav_avatar_img').css('backgroundImage');
        },
        
        eventListeners: function()
        {
            
            var on_sub_menu       = false;
            var on_bttn           = false;
            var sub_menu_open     = false;
            var nav_menu_wrapper  = $('#nav_menu_wrapper');
            var nav_sub_container = $('#nav_sub_container');
            var slider_pos        = [];
            var last_name         = '';
            
            $('div.nav_bttn').on( 'mouseenter', function() {
                
                // Animate Red Up
                // Animate Slider Over
                on_bttn = true;
                var jqself    = $(this);
                var this_name = jqself.attr('data-sub');
                var all_bttns = $('div.nav_bttn_active[data-sub!="'+this_name+'"]');
                var this_bttn = jqself.children('div.nav_bttn_active');
                                
                var left      = jqself.offset().left;
                var width     = jqself.width();
                
                if (slider_pos[0] == undefined) {
                    
                    var active_div = '<div class="nav_active_strip" style="width:'+width+'px;margin-left:'+left+'px;"></div>';
                    $('#nav_active_strip_container').html(active_div);
                    $('div.nav_active_strip').fadeIn(100);
                    
                }
                else {
                    
                    var active_div = '<div class="nav_active_strip" style="width:'+slider_pos[1]+'px;margin-left:'+slider_pos[0]+'px;"></div>';
                    slider_pos = [];
                    
                    $('#nav_active_strip_container').html(active_div);
                    $('div.nav_active_strip').show().animate({
                        marginLeft: left + 'px',
                        width: width + 'px'
                    }, 100); 
                    
                }
                
                slider_pos.push(left);
                slider_pos.push(width);
                
                // Stop all animations & reset
                $('div.nav_active').stop();
                all_bttns.stop().css({bottom: '-70px'});
                //nav_menu_wrapper.stop().css({height: '0px'});
                
                var this_bottom = parseInt(this_bttn.css('bottom'));
                
                if (this_bottom < 0) { // The Button is not red

                    this_bttn.animate({
                        bottom: '0px'
                    }, 100, function() {
                                             
                        
                        if (this_name != null) {
                            
                            var size = self.getMenuSize(this_name);
                            if (size == null) return;
                            
                            if (nav_menu_wrapper.height() > 0) {
                                
                                nav_menu_wrapper.animate({
                                    height: '0px'
                                }, 100, function() {
                                    
                                    self.buildNavMenu(this_name);
                                    
                                    if (size.type == 'full') {
                                
                                        nav_menu_wrapper.css( {
                                            width: size.x,
                                            marginLeft: 0
                                        } ).animate( {
                                            height: size.y + 'px'
                                        }, 100, function() {
                                            sub_menu_open = true;
                                        } );
                                        
                                    }
                                    else if (size.type == 'fixed') {
                                        
                                        nav_menu_wrapper.css( {
                                            width: size.x + 'px',
                                            marginLeft: left + 'px'
                                        } ).animate( {
                                            height: size.y + 'px'
                                        }, 100, function() {
                                            sub_menu_open = true;
                                        } );
                                        
                                    }
                                    else {
                                        
                                        nav_menu_wrapper.css( {
                                            width: '0px',
                                            height: '0px',
                                            marginLeft: '0px'
                                        } );
                                        sub_menu_open = false;
                                        
                                    }
                                    
                                } );
                                
                            }
                            else {
                                
                                sub_menu_open = false;
                                self.buildNavMenu(this_name);
                                
                                if (size.type == 'full') {
                                
                                    nav_menu_wrapper.css( {
                                        width: size.x,
                                        marginLeft: 0
                                    } ).animate( {
                                        height: size.y + 'px'
                                    }, 100, function() {
                                        sub_menu_open = true;
                                    } );
                                    
                                }
                                else if (size.type == 'fixed') {
                                    
                                    nav_menu_wrapper.css( {
                                        width: size.x + 'px',
                                        marginLeft: left + 'px'
                                    } ).animate( {
                                        height: size.y + 'px'
                                    }, 100, function() {
                                        sub_menu_open = true;
                                    } );
                                    
                                }
                                else {
                                    
                                    nav_menu_wrapper.css( {
                                        width: '0px',
                                        height: '0px',
                                        marginLeft: '0px'
                                    } );
                                    sub_menu_open = false;
                                    
                                }
                            
                            }
                            
                            last_name = this_name;
                                
                        }
                        
                    } );

                }
                else {
                    
                    // The button is already open && the menu is not open
                    // this_bttn.hasClass('nav_active')
                    
                    if (nav_menu_wrapper.height() == 0) {
                                                
                        if (this_name != null) {
                            
                            var size = self.getMenuSize(this_name);
                            if (size == null) return;
                            
                            sub_menu_open = false;
                            self.buildNavMenu(this_name);
                            
                            if (size.type == 'full') {
                            
                                nav_menu_wrapper.css( {
                                    width: size.x,
                                    marginLeft: 0
                                } ).animate( {
                                    height: size.y + 'px'
                                }, 100, function() {
                                    sub_menu_open = true;
                                } );
                                
                            }
                            else if (size.type == 'fixed') {
                                
                                nav_menu_wrapper.css( {
                                    width: size.x + 'px',
                                    marginLeft: left + 'px'
                                } ).animate( {
                                    height: size.y + 'px'
                                }, 100, function() {
                                    sub_menu_open = true;
                                } );
                                
                            }
                            else {
                                
                                nav_menu_wrapper.css( {
                                    width: '0px',
                                    height: '0px',
                                    marginLeft: '0px'
                                } );
                                sub_menu_open = false;
                                
                            }
                            
                            last_name = this_name;
                        }
                    
                    }
                    
                }
                
            } );
            
            $('div.nav_bttn').on( 'mouseleave', function() {
                on_bttn = false;
            } );
            
            nav_menu_wrapper.on( 'mouseenter', function() {
                on_sub_menu = true;
            } );
            
            nav_menu_wrapper.on( 'mouseleave', function(e) {

                on_sub_menu = false;
                var jqself = $(this);
                var bottom = jqself.offset().top + jqself.outerHeight();
                
                if (e.pageY >= bottom) {
                    
                    $('#nav_active_strip_container').html('');
                    nav_menu_wrapper.animate({height: '0px'}, 100);
                    $('div.nav_bttn_active:not(.nav_active)').animate({bottom: '-70px'}, 100, function() {
                        if ($('div.nav_active').css('bottom') != '0px') {
                            $('div.nav_active').animate({bottom: '0px'}, 100);
                            last_name = '';
                        }                            
                    } );
                    
                }
                
            } );
            
            nav_sub_container.on( 'mouseleave', function() {
                
                setTimeout( function() {
                    
                    if (!on_sub_menu && !on_bttn) {
                        
                        $('#nav_active_strip_container').html('');
                        nav_menu_wrapper.animate({height: '0px'}, 100);
                        $('div.nav_bttn_active:not(.nav_active)').animate({bottom: '-70px'}, 100, function() {
                            if ($('div.nav_active').css('bottom') != '0px') {
                                $('div.nav_active').animate({bottom: '0px'}, 100);
                                last_name = '';
                            }                            
                        } );
                        
                    }
                    
                }, 500);
                
            } );
            
            $('div.nav_menu_main_item_wrapper').on('mouseenter', function() {
                $(this).animate({
                    backgroundColor: '#ff0000',
                    /* color: '#FFF' */
                }, 100); 
            } );
            
            $('div.nav_menu_main_item_wrapper').on('mouseleave', function() {
            
                $(this).animate({
                    backgroundColor: 'transparent',
                    /* color: '#666666' */
                }, 100); 
                
            } );
            
            var search_icon_bttn = $('#search_icon_bttn');
            search_icon_bttn.on( 'click', function() {
                
                if ($('#search_container').width() != 200) {
                
                    self.resetNavMenu();
                    search_icon_bttn.css({
                        backgroundColor: '#FFF'
                    });
                    
                    $('#search_container').animate({
                        width: '200px'
                    }, 100, function() {
                        $('#search_container_x').show();
                    });
                
                }
                else {
                    
                    $('#search_form').submit();
                    
                }
                
            } );
            
            $('#search_container_x').on( 'click', function() {
                
                if ($('#search_container').width() == 200) {
                    
                    self.resetNavMenu();
                    search_icon_bttn.css({backgroundColor: ''});
                    $('#search_container').animate({
                        width: '0px'
                    }, 100);
                    
                }
                
            } );
            
            var our_sites_bttn      = $('#nav_our_sites_bttn');
            var our_sites_container = $('#nav_our_sites_container');
            our_sites_bttn.on( 'click', function() {
                
                if (our_sites_container.height() == 0) {
                    
                    $('#nav_our_sites_down').fadeOut(100);
                    our_sites_bttn.animate({
                        width: '150px'
                    }, 100);
                    
                    setTimeout( function() {
                        
                        $('#nav_our_sites_x').fadeIn(100);
                        our_sites_bttn.animate({
                            backgroundColor: '#FFF'
                        }, 100);
                        
                        our_sites_container.animate({
                            height: '140px'
                        }, 100).css({
                            border: '1px solid #EEE'
                        });
                    }, 100);
                    
                }
                else {

                    $('#nav_our_sites_x').fadeOut(100);
                    our_sites_container.animate({
                        height: '0px'
                    }, 100).css({
                        border: '0px solid transparent'
                    });

                    setTimeout( function() {
                    
                        $('#nav_our_sites_down').fadeIn(100);
                        our_sites_bttn.animate({
                            width: '104px'
                        }, 100);
                        
                        our_sites_bttn.animate({
                            backgroundColor: 'transparent',
                            border: '0px solid #EEE'
                        }, 100);
                        
                    }, 100);
                    
                }
                
            } );
            
            var search_icon_bttn = $('#search_icon_bttn');
            search_icon_bttn.on( 'click', function() {
                
                if ($('#search_container').width() != 200) {
                
                    //self.resetNavMenu();
                    search_icon_bttn.css({
                        backgroundColor: '#FFF'
                    });
                    
                    $('#search_container').animate({
                        width: '200px'
                    }, 100, function() {
                        $('#search_container_x').show();
                    });
                
                }
                else {
                    
                    $('#search_form').submit();
                    
                }
                
            } );
            
            $('#search_container_x').on( 'click', function() {
                
                if ($('#search_container').width() == 200) {
                    
                    self.resetNavMenu();
                    search_icon_bttn.css({backgroundColor: ''});
                    $('#search_container').animate({
                        width: '0px'
                    }, 100);
                    
                }
                
            } );
            
            $('#account_icon_bttn').on( 'click', function() {
                
                if (!is_logged_in) {
                    var size_to = 220;
                }
                else {
                    var size_to = 300;    
                }
                
                self.resetNavMenu();
                
                var wrapper = $('#mini_account_info_wrapper');          
                if (wrapper.height() != size_to) {
                    
                    if (avatar != undefined) {
                        $('#nav_avatar_img').css({
                            backgroundImage: 'url()'
                        }).html('<div class="nav_x"></div>');
                    }
                    
                    wrapper.animate({height: size_to + 'px'}, 100);
                    $(this).css({
                        backgroundColor: '#FFF'
                    });
        
                }
                else {
                    
                    wrapper.animate({height: '0px'}, 100);
                    $(this).css({
                        backgroundColor: ''
                    });
                    
                }
                
            } );
            
        },
                
        resetNavMenu: function()
        {
            
            $('#mini_account_info_wrapper').animate({height: '0px'}, 100);
            $('#account_icon_bttn').css({backgroundColor: ''});
            
            $('#search_icon_bttn').css({backgroundColor: ''});
            $('#search_container').animate({width: '0px'}, 100);
            
            $('#search_container_x').hide();
                        
            if (avatar != undefined) {
                $('#nav_avatar_img').css({
                    backgroundImage: avatar
                }).html('');
            }
            
        },
        
        buildNavMenu: function(key)
        {
            
            $('div.nav_menu_group').hide();
            
            if (key == 'products') {
                
                $('#product_nav_group').show();
                
            }
            else if (key == 'news') {
                
                $('#news_nav_group').show();
                
            }
            else if (key == 'explore') {
                
                $('#explore_nav_group').show();
                
            }
            else if (key == 'community') {
                
                $('#community_nav_group').show();
                
            }
            else if (key == 'stores') {
                
                $('#stores_nav_group').show();
                
            }
            
        },
        
        getMenuSize: function(key)
        {
            return navigation[key];  
        },
        
        stickyHeader: function()
        {
            
            $(document).on( 'scroll', function() {
            
                var scroll_top = $(window).scrollTop();
                
                if (scroll_top >= 146) {
                    
                    $('#mb_sub_nav_holder').show();
                    $('#mb_sub_nav_wrapper').css( {
                        'position' : 'fixed', 
                        'top': '0px',
                        'box-shadow': '0px 0px 10px 1px #CCC'
                    } );
                    
                }
                else if (scroll_top < 146) {
                    
                    $('#mb_sub_nav_holder').hide();
                    $('#mb_sub_nav_wrapper').css( {
                        'position' : 'relative', 
                        'top': '',
                        'box-shadow': ''
                    } );
                       
                }
                
            });
                        
        }
        
    }
    return MakerBotNav;
    
} )();
