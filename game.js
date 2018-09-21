$(function () {
    // Interval control
    window.originalSetInterval = window.setInterval;
    window.originalClearInterval = window.clearInterval;
    window.activeIntervals = 0;
    window.setInterval = function (func, delay) {
        if (func && delay) {
            window.activeIntervals++;
        }
        return window.originalSetInterval(func, delay);
    };
    window.clearInterval = function (intervalId) {
        if (intervalId !== true) {
            window.activeIntervals--;
        }
        return window.originalClearInterval(intervalId);
    };

    // Variables
    var results = [];
    var playerName = '';
    var startTime = '';
    var timer = 60;
    var collide = {};
    var countdown = null;

    var gameScreen = (function () {
        var windowHeight = 0.0;
        var htmlStruct = "<div id='gameScreen'></div>";
        var jumping = false;
        var cloudsSpeed = 10000;
        var climbedAltitude = 0.0;
        var avatarRadius = 0.0;
        var cloudRadius = 75.0;
        var reachedCloudLevel = 0;
        var clouds = [];
        var score = 0.0;
        var removeFirstCloud = false;
        return {
            htmlStruct: function () {
                return htmlStruct;
            },
            stop: function () {
                this.jumping = false;
            },
            start: function () {
                this.jumping = true;
            },
            windowHeight: windowHeight,
            jumping: jumping,
            cloudsSpeed: cloudsSpeed,
            clouds: clouds,
            climbedAltitude: climbedAltitude,
            avatarRadius: avatarRadius,
            cloudRadius: cloudRadius,
            reachedCloudLevel: reachedCloudLevel,
            score: score
        }
    })();
    var avatar = (function () {
        var htmlStruct = "<div id='avatar'></div>";
        return {
            htmlStruct: function () {
                return htmlStruct;
            }
        }
    })();
    var cloudTypes = ['cloud1', 'cloud2', 'cloud3'];
    var cloudCount = 0;
    class Cloud {
        constructor(height) {
            this.id = 'cloud' + cloudCount;
            cloudCount++;
            this.height = height;
            var typeIndex = Math.floor(Math.random() * 3);
            this.cloudType = cloudTypes[typeIndex];
            this.hitsCount = 0;
            this.htmlStruct = '<div id="' + this.id + '" class="cloud ' + this.cloudType + '"></div>';
            this.increaseHits = function () {
                this.hitsCount++;
            }
        }

        get cloudHtml() {
            return this.htmlStruct;
        }
        get cloudHeight() {
            return this.height;
        }
        get nmbrOfHits() {
            return this.hitsCount;
        }
    }

    function checkCollision() {
        var x1 = $("#avatar").offset().left;
        var y1 = $("#avatar").offset().top;
        var x2 = $("#" + gameScreen.clouds[0].id).offset().left;
        var y2 = $("#" + gameScreen.clouds[0].id).offset().top - 20;
        var altitude = gameScreen.windowHeight * 0.2;
        var firstCollision = true;

        var dx = x2 - x1,
            dy = y2 - y1,
            L = Math.sqrt(dx * dx + dy * dy),
            step = gameScreen.avatarRadius + gameScreen.cloudRadius - L;

        if (step > 0) {
            if (gameScreen.clouds[0].nmbrOfHits > 0) {
                firstCollision = false;
            }
            gameScreen.removeFirstCloud = false;
            gameScreen.clouds[0].increaseHits();
            gameScreen.reachedCloudLevel = 1;
            return {
                is: true,
                altitude: altitude,
                firstCollision: firstCollision
            };
        } else {
            gameScreen.removeFirstCloud = false;
            gameScreen.reachedCloudLevel = 0;
            return {
                is: false
            };
        }
    }

    function checkCollisionSecondCloud() {
        var
            x1 = $("#avatar").offset().left, // x position
            y1 = $("#avatar").offset().top; // y position        
        var x2 = $("#" + gameScreen.clouds[1].id).offset().left;
        var y2 = $("#" + gameScreen.clouds[1].id).offset().top - 20;
        var altitude = gameScreen.windowHeight * 0.4;
        var firstCollision = true;
        var dx = x2 - x1, // Difference in horizontal position
            dy = y2 - y1, // Difference in vertical position
            L = Math.sqrt(dx * dx + dy * dy), // Distance between
            step = gameScreen.avatarRadius + gameScreen.cloudRadius - L; // Amount of overlap

        if (step > 0) { // There's a collision if step > 0
            gameScreen.removeFirstCloud = false;
            if (gameScreen.clouds[1].nmbrOfHits > 0) {
                firstCollision = false;
            }
            //console.log(gameScreen.clouds[1].nmbrOfHits);
            gameScreen.clouds[1].increaseHits();
            gameScreen.reachedCloudLevel = 2;
            return {
                is: true,
                altitude: altitude,
                firstCollision: firstCollision
            };
        } else {
            gameScreen.removeFirstCloud = false;
            var colide = checkCollision();
            gameScreen.reachedCloudLevel = 1;
            return colide;
        }
    }

    function checkCollisionThirdCloud() {
        var
            x1 = $("#avatar").offset().left,
            y1 = $("#avatar").offset().top + 120;
        var x2 = $("#" + gameScreen.clouds[2].id).offset().left;
        var y2 = $("#" + gameScreen.clouds[2].id).offset().top - 20;
        var altitude = gameScreen.windowHeight * 0.6;
        var firstCollision = true;
        var dx = x2 - x1,
            dy = y2 - y1,
            L = Math.sqrt(dx * dx + dy * dy),
            step = gameScreen.avatarRadius + gameScreen.cloudRadius - L;


        if (step > 0) {
            if (gameScreen.clouds[2].nmbrOfHits > 0) {
                firstCollision = false;
            }
            // gameScreen.reachedCloudLevel=3;

            if (gameScreen.clouds[2].nmbrOfHits == 0) {
                // console.log("You are on this cloud for the first time boy..!");
                gameScreen.clouds.push(new Cloud(80));
                $("#gameScreen").append(gameScreen.clouds[gameScreen.clouds.length - 1].cloudHtml);
                $("#" + gameScreen.clouds[gameScreen.clouds.length - 1].id).css({
                    bottom: '100vh',
                    left: Math.floor(Math.random() * 100) + 'vw',
                    'opacity': 0
                });
                // $(".cloud").queue(); //.stop();
                $(".cloud").velocity("stop");
                $(".cloud").velocity({
                    'bottom': '-=20vh'
                }, {
                    duration: 400,
                    queue: false,
                    easing: 'linear',
                    begin: function () {
                        $("#avatar").clearQueue().velocity({
                            'bottom': '-=160px'
                        }, {
                            duration: 300,
                            queue: false,
                            easing: 'linear'
                        });
                        $("#" + gameScreen.clouds[gameScreen.clouds.length - 1].id).velocity({
                            'opacity': 1
                        }, {
                            duration: 300,
                            queue: false,
                            easing: 'linear',
                            begin: function () {
                                $("#" + gameScreen.clouds[0].id).velocity({
                                    'opacity': 0,
                                    'bottom': 0
                                }, {
                                    duration: 300,
                                    queue: false,
                                    easing: 'linear'
                                });
                            }
                        });


                    },
                    /*start - jquery  */

                });
                altitude = gameScreen.windowHeight * 0.4;


                gameScreen.removeFirstCloud = true;
                var idToRemove = gameScreen.clouds[0].id;
                gameScreen.clouds.splice(0, 1);
                $("#" + idToRemove).remove();
                //cloudsMove();             
                gameScreen.clouds[1].increaseHits();
                gameScreen.reachedCloudLevel = 2;
                // lower the clouds movement duration to limit of 3000ms
                if (gameScreen.cloudsSpeed > 3000) {
                    gameScreen.cloudsSpeed = gameScreen.cloudsSpeed - (gameScreen.cloudsSpeed / 100) * gameScreen.score;
                }

                cloudsMove();
            }
            return {
                is: true,
                altitude: altitude,
                firstCollision: firstCollision
            };
        } else {
            gameScreen.removeFirstCloud = false;
            var colide = checkCollisionSecondCloud();
            gameScreen.reachedCloudLevel = 2;
            return colide;
        }
    }

    function avatarDied() {
        originalClearInterval(countdown);
        countdown = null;
        $('.cloud').velocity("stop");
        gameScreen.stop();
        writeScore();
        if (window.activeIntervals > 0) {
            for (var i = 0; i < window.activeIntervals; i++) {
                clearTimeout(i);
            }
        }
        $('#avatar').stop();
        $(document).clearQueue().dequeue().stop();
        $(document).off('keydown');
        $(document).off('keyup');
        $("#avatar").velocity({
            'height': 0,
            'bottom': 0
        }, {
            duration: 400,
            queue: false,
            easing: 'easeOutQuad',
            complete: function () {
                $("#gameScreen").remove();
                $('.backdrop').addClass('active');

                $('#resultScreen').addClass('active');
            }

        });


    }

    // Sort array of scores per score

    function sortScores(a, b) {
        if (a.score < b.score)
            return 1;
        if (a.score > b.score)
            return -1;
        return 0;
    }

    // R/W scores to local storage and to DOM element  

    function writeScore() {
        var storedResults = JSON.parse(localStorage.getItem("bestTwenty"));
        if (!!storedResults) {
            // if(storedResults.length>0)
            {
                storedResults.forEach(function (result) {
                    results.push(result);
                });
            }
        }
        results.push({
            playerName: playerName,
            startTime: startTime,
            score: gameScreen.score
        });
        
        var sortedScores = results.sort(sortScores);
        var bestTwenty = sortedScores.splice(0, 20);
        
        localStorage.setItem('bestTwenty', JSON.stringify(bestTwenty));
        var resultList = JSON.parse(localStorage.getItem("bestTwenty"));
        if (resultList != 'null') {
            if (resultList.length > 0) {
                var sortedList = resultList.sort(sortScores);
                var list = $("<ul id='resultList'></ul>");
                sortedList.forEach(function (result) {
                    list.append("<li><span class='playerName'>" + result.playerName + "</span><span class='playTime'>" + result.startTime + "</span><span class='socreResult'>" + result.score + "</span></li>");
                });

                $("#results").html(list);
            }
        }
    }

    // Avatar recursive animation

    function jumpBoy() {
        var altitudeFromCollision = 0;
        if (gameScreen.jumping) {
            $('#avatar').animate({
                'bottom': 0
            }, {
                duration: 400,
                easing: 'easeInQuad',
                queue: false,
                step: function (currentBottom) {
                    //var collide={};

                    if (gameScreen.reachedCloudLevel >= 2) {

                        // console.log('Check collision with the second cloud!');
                        collide = checkCollisionThirdCloud();
                    } else if (gameScreen.reachedCloudLevel == 1) {

                        // console.log('Check collision with the second cloud!');
                        collide = checkCollisionSecondCloud();
                    } else {
                        //  console.log('Check collision with the first cloud!');
                        collide = checkCollision();
                    }
                    if (collide.is) {
                        if (collide.firstCollision) {
                            gameScreen.score++;
                            $("#resultBox").text(gameScreen.score);

                        }
                        gameScreen.climbedAltitude = collide.altitude;
                        //altitudeFromCollision = collide.altitude;  
                        $('#avatar').stop(true).queue();
                    } else {
                        if (currentBottom < gameScreen.climbedAltitude)
                            //console.log('You are falling' );
                            if (currentBottom < gameScreen.windowHeight * 0.2 && gameScreen.score != 0) {
                                //  console.log('You missed clouds below. You are dead! ');
                                avatarDied();
                            }
                    }
                },
                fail: function () {
                    if (gameScreen.jumping) {
                        $('#avatar').clearQueue();
                        //gameScreen.climbedAltitude =altitudeFromCollision;
                        $('#avatar').velocity({
                            'bottom': gameScreen.climbedAltitude + (gameScreen.windowHeight * 0.22)
                        }, 500, false, 'easeOutQuad', function () {
                            jumpBoy();
                        });
                    }
                },
                complete: function () {
                    if (gameScreen.jumping) {
                        $('#avatar').clearQueue();
                        $('#avatar').velocity({
                            'bottom': gameScreen.climbedAltitude + (gameScreen.windowHeight * 0.22)
                        }, 500, false, 'easeOutQuad', function () {
                            jumpBoy();
                        });
                    } else {
                        $('#avatar').clearQueue();
                        $('#avatar').velocity({
                            'bottom': 0
                        }, 400, false, 'easeInQuad');
                    }
                }
            });
        } else {
            $('#avatar').clearQueue();
            $('#avatar').velocity({
                'bottom': 0
            }, 400, false, 'easeInQuad');
        }
    }

    // Cloud animation recursive loops

    function cloudsMove() {
        var availableWidth = $(window).width() - 150;

        function loopc1(depth1) {
            if (typeof depth1 == 'number') {
                //console.log("Count of reursive calls for cloud 1:",depth1);
                depth1++;
            } else {
                depth1 = 0;
            }
            var speed = Math.floor(gameScreen.cloudsSpeed);
            var leftPercentage = ($("#" + gameScreen.clouds[0].id).position().left / $(window).width());
            //console.log(leftPercentage);
            if (depth1 == 0 || gameScreen.removeFirstCloud) {
                speed = Math.floor(gameScreen.cloudsSpeed * leftPercentage);
            } else {
                speed = Math.floor(gameScreen.cloudsSpeed);
            }

            $("#" + gameScreen.clouds[0].id).velocity({
                left: 0
            }, {
                duration: speed,
                easing: 'linear',
                complete: function () {
                    $("#" + gameScreen.clouds[0].id).velocity({
                        left: availableWidth + 'px'
                    }, {
                        duration: gameScreen.cloudsSpeed,
                        easing: 'linear',
                        complete: function () {
                            if (gameScreen.jumping) {
                                loopc1(depth1);
                            } else {
                                return;
                            }
                        }
                    });
                }
            });
        }

        function loopc2(depth2) {
            if (typeof depth2 == 'number') {
                //console.log("Count of reursive calls for cloud 2:",depth2);
                depth2++;
            } else
                depth2 = 0;
            var leftPercentage = 1 - ($("#" + gameScreen.clouds[1].id).position().left / $(window).width());
            var speed = Math.floor(gameScreen.cloudsSpeed);
            if (depth2 == 0 || gameScreen.removeFirstCloud) {
                // if(leftPercentage<0.5)
                speed = Math.floor(gameScreen.cloudsSpeed * leftPercentage);
                // else
                //   var speed = Math.floor(gameScreen.cloudsSpeed); 
            } else {
                speed = Math.floor(gameScreen.cloudsSpeed);
            }

            $("#" + gameScreen.clouds[1].id).velocity({
                left: availableWidth + 'px'
            }, {
                duration: speed,
                easing: 'linear',
                complete: function () {
                    $("#" + gameScreen.clouds[1].id).velocity({
                        left: 0
                    }, {
                        duration: gameScreen.cloudsSpeed,
                        easing: 'linear',
                        complete: function () {
                            if (gameScreen.jumping) {
                                loopc2(depth2);
                            } else {
                                return;
                            }
                        }
                    });
                }
            });
        }

        function loopc3(depth3) {
            if (typeof depth3 == 'number')
                depth3++;
            else
                depth3 = 0;
            var leftPercentage = ($("#" + gameScreen.clouds[2].id).position().left / $(window).width());
            var speed = Math.floor(gameScreen.cloudsSpeed);
            //console.log('Cloud 3 left percentage',leftPercentage);
            if (depth3 == 0 || gameScreen.removeFirstCloud) {

                speed = Math.floor(gameScreen.cloudsSpeed * leftPercentage);

            } else {
                speed = Math.floor(gameScreen.cloudsSpeed);
            }

            $("#" + gameScreen.clouds[2].id).velocity({
                left: 0
            }, speed, 'linear', function () {
                $("#" + gameScreen.clouds[2].id).velocity({
                    left: availableWidth + 'px',
                }, gameScreen.cloudsSpeed, 'linear', function () {
                    if (gameScreen.jumping) {
                        loopc3(depth3);
                    } else {
                        return;
                    }
                });
            });
        }

        function loopc4(depth4) {
            if (typeof depth4 == 'number') {
                depth4++;
            } else {
                depth4 = 1;
            }
            var leftPercentage = 1 - ($("#" + gameScreen.clouds[3].id).position().left / $(window).width());
            var speed = Math.floor(gameScreen.cloudsSpeed);
            if (depth4 == 0 || gameScreen.removeFirstCloud) {
                //console.log("First cloud removed and first call of loop for cloud 4",depth4);
                speed = Math.floor(gameScreen.cloudsSpeed * leftPercentage);
            } else {
                speed = Math.floor(gameScreen.cloudsSpeed);
            }
            $("#" + gameScreen.clouds[3].id).velocity({
                left: availableWidth + 'px',
            }, speed, 'linear', function () {
                $("#" + gameScreen.clouds[3].id).velocity({
                    left: 0
                }, gameScreen.cloudsSpeed, 'linear');
                if (gameScreen.jumping) {
                    loopc4(depth4);
                } else {
                    return;
                }
            });
        }
        var depth1 = 0,
            depth2 = 0,
            depth3 = 0,
            depth4 = 0;
        loopc1(depth1);
        loopc2(depth2);
        loopc3(depth3);
        loopc4(depth4);
    }

    // Initializing game 

    function init() {
        var playtimer = timer;
        $('.backdrop').removeClass('active');
        $('#resultScreen').removeClass('active');
        $('#startScreen').removeClass('active');
        gameScreen.windowHeight = $(window).height();
        $(document.body).append(gameScreen.htmlStruct());
        $("#gameScreen").append(avatar.htmlStruct());
        $("#gameScreen").append("<div id='resultBox'></div>");
        $("#gameScreen").append("<div id='timer'></div>");
        gameScreen.avatarRadius = $('#avatar').width() / 2;
        for (var i = 0; i < 4; i++) {
            gameScreen.clouds[i] = new Cloud(((i + 1) * 20));
            $("#gameScreen").append(gameScreen.clouds[i].cloudHtml);
            $("#" + gameScreen.clouds[i].id).css({
                bottom: gameScreen.clouds[i].height + 'vh',
                left: Math.floor(Math.random() * 100) + 'vw'
            });
        }
        gameScreen.start();
        cloudsMove();
        jumpBoy();
        enableControls();
        countdown = originalSetInterval(function () {
            //console.log("Countdown:", playtimer);
            playtimer--;
            $("#timer").text(playtimer);
            if (playtimer == 0 || gameScreen.jumping == false) {
                originalClearInterval(countdown);
                countdown = null;
                avatarDied();
            }
        }, 1000);
    }

    // Left and right movement control

    function enableControls() {
        var interval;
        var called = false;

        $(document).on('keydown', function (e) {
            e.preventDefault();
            if (interval == null) {
                if (gameScreen.jumping) {
                    called = false;
                    if (e.keyCode == 37 || e.keyCode == 39) {
                        interval = setInterval(function () {
                            var avatarPosition = $("#avatar").position();
                            if (typeof avatarPosition !== "undefined") {
                                switch (e.keyCode) {
                                    case 37:
                                        if (avatarPosition.left > 20) {
                                            $('#avatar').animate({
                                                'left': avatarPosition.left - 20 + 'px'
                                            }, {
                                                duration: 50,
                                                queue: false,
                                                easing: 'linear'
                                            });
                                        }
                                        break;
                                    case 39:
                                        if (avatarPosition.left < ($("#gameScreen").width() - $("#avatar").width() - 20)) {
                                            $('#avatar').animate({
                                                'left': avatarPosition.left + 20 + 'px'
                                            }, {
                                                duration: 50,
                                                queue: false,
                                                easing: 'linear'
                                            });
                                        }
                                        break;
                                    default:
                                        break;
                                }
                                called = true;
                            } else {
                                clearInterval(interval);
                                interval = null;
                            }
                        }, 40);
                    }
                }
            }
        }).on('keyup', function (e) {
            clearInterval(interval);
            interval = null;
        });
    }


    // Get formated date
    function getFormatedDate() {
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        return curr_date + '.' + curr_month + '.' + curr_year + ' - ' + curr_hour + ':' + curr_min;
    }
    // Statring the game
    $("#userName").on('keyup', function () {
        if (!$('#userName').val()) {
            $("#userNameEmpty").addClass('active');
        } else {
            $("#userNameEmpty").removeClass('active');
        }
    });
    $("#start").on('click', function () {
        if (!$('#userName').val()) {
            $("#userNameEmpty").addClass('active');
        } else {
            playerName = $('#userName').val();

            startTime = getFormatedDate();
            //results=[];
            results.splice(0, results.length);
            init();
        }
    });

    //Restarting the game

    $(".restart").on('click', function () {
        gameScreen.clouds = [];
        gameScreen.climbedAltitude = 0.0;
        gameScreen.reachedCloudLevel = 0.0;
        gameScreen.cloudsSpeed = 10000;
        gameScreen.score = 0.0;
        gameScreen.removeFirstCloud = false;
        startTime = getFormatedDate();
        results.splice(0, results.length);
        collide = {};
        timer = 60;
        originalClearInterval(countdown);
        countdown = null;
        init();
    });
});