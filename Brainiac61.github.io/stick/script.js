'use strict';

$(window).load(function () {

    var i;
    var gameTimer;
    var score = 0;
    var highscore = 0;
    var gameStarted = false;
    var mouseDown = false;
    var ctx;
    var canvas;
    var width, height;
    var random;
    var interval = 30;

    var player = {
        state: 'rest', // rest or running
        pos: 'up', // up or down        
        height: 30,
        width: 20,
        x: 0,
        y: 0,
        speed: 8,
        defaultSpeed: 8,
        acceleration: 0.1,
        fallSpeed: 20,
        defaultFallSpeed: 20,
        color: 'black',
        bandColor: 'red',
        eyeColor: 'white',
        legsize: 5,

        drawPlayer: function () {

            var bandY = player.y + player.height / 4;
            var eyeY = player.y + player.height / 4 + 2;
            var feetY = player.y + player.height - player.legsize;


            if (player.pos === 'down') {

                bandY = player.y + 3 * player.height / 4;
                eyeY = player.y + 3 * player.height / 4 - 2;
                feetY = player.y - player.legsize / 2;
            }


            //body
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height - player.legsize);

            //band
            ctx.fillStyle = player.bandColor;
            ctx.fillRect(player.x, bandY, player.width, player.width / 4);
            //knot
            ctx.beginPath();
            ctx.fillStyle = player.bandColor;
            ctx.moveTo(player.x, bandY);
            ctx.lineTo(player.x - player.legsize, bandY - 2.5);
            ctx.lineTo(player.x - 2.5, bandY + 2.5);
            ctx.lineTo(player.x - player.legsize, bandY + player.legsize);
            ctx.lineTo(player.x, bandY + 2.5);
            ctx.fill();
            ctx.closePath();

            //eye
            ctx.beginPath();
            ctx.fillStyle = player.eyeColor;
            ctx.arc(player.x + 3 * player.width / 4, eyeY, 2, 0, 2 * Math.PI);
            ctx.fill();

            //feet
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.arc(player.x + player.legsize, feetY, player.legsize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.arc(player.x + player.width - player.legsize, feetY, player.legsize, 0, 2 * Math.PI);
            ctx.fill();


        }

    }

    var stick = {

        length: 0,
        startPoint: {
            x: 0,
            y: 0
        },
        endPoint: {
            x: 0,
            y: 0
        },
        state: 'rest', // rest, drawing, inUse
        color: 'black',
        width: 3,
        unit: 10,
        angle: 270,
        fallAngleSpeed: 10,
        deafultAngleSpeed: 10

    };

    var walls = [];

    var wall = {

        currentIndex: 0,
        state: 'rest', //rest, moving
        y: 0,
        speed: 15,
        defaultSpeed: 15,
        acceleration: 3,
        height: 500,
        minWidth: 50,
        maxWidth: 100,
        minDistance: 100,
        maxDistance: 500,
        leftMargin: 500,
        color: 'black',
        center: {
            width: 15,
            height: 5,
            color: 'red'
        }


    };

    var coin = {
        size: 10,
        color: "red",
        state: 0,
        x: 0,
        y: 0,
        coins: 0,

        drawcoin: function () {


        	var img = new Image();
        	img.src = 'img/coin.png';

            if (coin.state) {
                // ctx.beginPath();
                // ctx.arc(coin.x, coin.y, coin.size, 0, 2 * Math.PI);
                // ctx.stroke();

                ctx.drawImage(img, coin.x - coin.size, coin.y - coin.size, coin.size*2, coin.size*2);

                if (coin.x > player.x && coin.x < player.x + player.width && player.pos === 'down') {
                    coin.state = 0;
                    coin.coins++;
                }


            }
        }
    }

    function start() {

        setCanvas();
        setDefault();

        gameTimer = setInterval(update, interval);
        gameStarted = true;
    }

    setCanvas();
    setDefault();
    homePage();

    function setDefault() {
        // set default values
        score = 0;
        coin.coins = 0;
        walls = [];
        wall.currentIndex = 0;
        player.state = 'rest';
        stick.state = 'rest';
        wall.state = 'rest';
        coin.state = 0;
        player.pos = 'up';
        wall.maxDistance = height/2;
        wall.leftMargin = width/2 - wall.maxWidth;
        wall.y = height / 1.5;
        coin.y = wall.y + 2 * coin.size;

        generateWall();

        player.x = walls[0].x + walls[0].width - player.width - 5;
        player.y = wall.y - player.height;


        ctx.clearRect(0, 0, width, height);
        drawWalls();
        player.drawPlayer();
        drawScore();

        // hide it initially
        $("#perfect").fadeOut(1);
        $("#deathBox").fadeOut(1);
        $("#restart").fadeOut(1);
    }

    function setCanvas() {
        canvas = $("#canvas")[0];
        ctx = canvas.getContext('2d');

        width = $(window).width();
        height = $(window).height();
        canvas.width = width;
        canvas.height = height;

        $("#start").css("left", width / 2 - parseInt($("#start").css('width')) / 2);
        $("#start").css("top", height / 2 - parseInt($("#start").css('height')) / 2);

        $("#title").css("left", width / 2 - parseInt($("#title").css('width')) / 2);



        $("#deathBox").css("left", width / 2 - parseInt($("#deathBox").css('width')) / 2);
        $("#deathBox").css("top", height / 2 - parseInt($("#deathBox").css('height')) / 2);

        $("#perfect").css("left", width / 2 - parseInt($("#perfect").css('width')) / 2);
        $("#perfect").css("top", height / 2 - parseInt($("#perfect").css('height')) / 2);

    }

    function update() {

        ctx.clearRect(0, 0, width, height);

        drawWalls();
        coin.drawcoin();
        player.drawPlayer();
        drawScore();

        if (stick.state === 'drawing' || stick.state === 'inUse' || stick.state === 'falling') {

            if (stick.state === 'drawing') {

                stick.startPoint = {
                    x: walls[wall.currentIndex].x + walls[wall.currentIndex].width,
                    y: walls[wall.currentIndex].y,
                };

                stick.endPoint = {
                    x: walls[wall.currentIndex].x + walls[wall.currentIndex].width,
                    y: walls[wall.currentIndex].y - stick.length
                }

                stick.length += stick.unit;

                ctx.beginPath();
                ctx.strokeStyle = stick.color;
                ctx.lineWidth = stick.width;
                ctx.moveTo(stick.startPoint.x, stick.startPoint.y);
                ctx.lineTo(stick.endPoint.x, stick.endPoint.y);
                ctx.stroke();
            }

            if (stick.state === 'inUse') {
                ctx.beginPath();
                ctx.strokeStyle = stick.color;
                ctx.lineWidth = stick.width;
                ctx.moveTo(stick.startPoint.x, stick.startPoint.y);
                ctx.lineTo(stick.endPoint.x, stick.endPoint.y);
                ctx.stroke();
            }

            if (stick.state === 'falling') {
                if (stick.angle <= 360) {

                    interval = 10;
                    ctx.beginPath();
                    lineToAngle(ctx, stick.startPoint.x, stick.startPoint.y, stick.length, stick.angle);
                    ctx.stroke();
                    stick.angle += stick.fallAngleSpeed;
                    stick.fallAngleSpeed++;



                } else {
                    stick.state = 'inUse';
                    player.state = 'running';
                    interval = 30;
                    stick.fallAngleSpeed = stick.deafultAngleSpeed;
                }
            }

        }

        if (player.state === 'running') {

            // if player hasn't reached the end of stick
            if (player.x + player.width < stick.endPoint.x && stick.state === 'inUse') {
                player.x += player.speed;
                player.speed += player.acceleration;
            } else {
                player.state = 'rest';
                player.speed = player.defaultSpeed;
                player.x -= player.speed / 2;

                // check if  player is dead or alive
                if (stick.endPoint.x > walls[wall.currentIndex + 1].x && stick.endPoint.x < walls[wall.currentIndex + 1].x + walls[wall.currentIndex + 1].width && player.pos === 'up') {

                    //player is alive
                    wall.state = 'moving'; // move the walls leftwards
                    wall.currentIndex++;

                    if (random(1, 100) % 2 === 0) {
                        coin.state = 1;
                        coin.x = random(walls[wall.currentIndex].x + walls[wall.currentIndex].width + 2 * coin.size, walls[wall.currentIndex + 1].x - 2 * coin.size);
                    }

                    stick.state = 'rest';
                    console.log('alive');
                    score++; //add score
                } else {
                    //player is dead
                    console.log('dead');
                    player.state = 'falling';
                }


            }
        }

        if (wall.state === 'moving') {

            // move all the walls left
            if (walls[wall.currentIndex].x > wall.leftMargin) {


                for (i = 0; i < walls.length; i++) {
                    walls[i].x -= wall.speed;
                }

                player.x -= wall.speed;
                coin.x -= wall.speed;

                wall.speed += wall.acceleration;

            } else {
                wall.state = 'rest';
                stick.state = 'rest';
                wall.speed = wall.defaultSpeed;
            }
        }

        if (player.state === 'falling') {
            if (player.y < height) {
                player.y += player.fallSpeed;
                player.fallSpeed += player.acceleration;
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                ctx.arc(stick.endPoint.x, stick.endPoint.y, 5, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                stopGame();
                player.fallSpeed = player.defaultFallSpeed;
            }
        }

    }

    function drawWalls() {

        // draw only two walls
        for (i = 0; i < 2; i++) {
            ctx.fillStyle = wall.color;
            ctx.fillRect(walls[i + wall.currentIndex].x, walls[i + wall.currentIndex].y, walls[i + wall.currentIndex].width, wall.height);

            ctx.fillStyle = wall.center.color;
            ctx.fillRect(walls[i + wall.currentIndex].x + walls[i + wall.currentIndex].width / 2 - wall.center.width / 2, wall.y, wall.center.width, wall.center.height);
        }


    }

    function drawScore() {

        ctx.fillStyle = 'black';
        ctx.font = "20px cursive";
        ctx.fillText("Score  : " + score, 50, 50);
        ctx.fillStyle = 'dodgerblue';
        ctx.fillText("coin : " + coin.coins, 50, 80);
    }


    function drawBallons(){
    	
    }

    function generateWall() {

        // initial wall
        walls.push({
            x: wall.leftMargin,
            y: wall.y,
            width: random(wall.minWidth, wall.maxWidth),
            distance: 0,
        });

        for (i = 1; i < 1000; i++) {

            var distance = random(wall.minDistance, wall.maxDistance);
            walls.push({

                distance: distance,
                x: walls[i - 1].x + walls[i - 1].width + distance,
                y: wall.y,
                width: random(wall.minWidth, wall.maxWidth),

            });
        }

    }

    function random(min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function stopGame() {
        clearInterval(gameTimer);
        death();
    }

    function startGame() {
        start();
        $("#start").css('visibility', 'hidden');
        $("#title").css('visibility', 'hidden');
    }

    function homePage() {
        setDefault();
        gameStarted = false;
        $("#start").css('visibility', 'visible');
        $("#title").css('visibility', 'visible');
        $("#deathBox").fadeOut(1);
        $("#restart").fadeOut(1);
    }

    function death() {

        var fadeSpeed = 200;

        $("#deathBox").fadeIn(fadeSpeed);
        $("#restart").fadeIn(fadeSpeed);

        $("#score").text("Score : " + score);
        if (score > highscore) highscore = score;
        $("#highScore").text("Highscore : " + highscore);
    }

    $("#canvas").on('mousedown touchstart', function () {

        if (gameStarted) {

            if (player.state === 'rest') {
                stick.length = 0;
                stick.state = 'drawing';
            } else if (player.state === 'running') {
                if (player.pos === 'up') {
                    player.y += player.height + player.legsize;
                    player.pos = 'down';
                } else {
                    player.y -= player.height + player.legsize;
                    player.pos = 'up';
                }
            }


        }

    });

    $("#canvas").on('mouseup touchend', function () {

        if (stick.state === 'drawing') {
            stick.state = 'falling';

            stick.endPoint = {
                x: stick.startPoint.x + stick.length,
                y: stick.startPoint.y,
            }

            stick.angle = 270;

            //check perfect
            if (stick.endPoint.x > walls[wall.currentIndex + 1].x + walls[wall.currentIndex + 1].width / 2 - wall.center.width / 2 && stick.endPoint.x < walls[wall.currentIndex + 1].x + walls[wall.currentIndex + 1].width / 2 + wall.center.width / 2) {
                console.log("Perfect");
                score += 9; // give 9 points on perfect
                $("#perfect").fadeIn(100, function () {
                    $("#perfect").fadeOut(1000);
                });
            }

        }

    });

    $(".start").on('click touchstart', function () {
        startGame();
    });

    $("#home").on('click touchstart', function () {
        homePage();
    });

    function lineToAngle(ctx, x1, y1, length, angle) {

        angle *= Math.PI / 180;

        var x2 = x1 + length * Math.cos(angle),
            y2 = y1 + length * Math.sin(angle);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        return {
            x: x2,
            y: y2
        };
    }

});