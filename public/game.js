import {Laser,LaserGroup} from './entity/laser.js';
import {Alien,AlienGroup,AlienLaserGroup} from './entity/alien.js';
var timeLoad;
var score = 0;
var scoreText;
var ammo = 3;
var ammoText;
var timeText;
var timedEvent;
var lastLaserTime = 0;
var startGame;
var gameOverText;
var modeText;
var socket;
var countDownText;
var classification;
var start= false;
var pointText;
var loadText;
var point = [];
var button;
var image;
var nPlayer;
var image1;
var image2;
var image3;
var image4;
var image5;
var formCreateRoom;
var formJoinRoom;
var activeDescription;
var lobby;
var load=false;
var nickname;
var roomName;
var players;
function Game()
{
	scene.start('GameScene');
}
function removeAlien(alien,laser){
	var explosion = this.sound.add('explosion');	
	alien.disableBody(true,true);
	laser.hit();
	explosion.play();
	score += 10;
	scoreText.setText('Score: ' + score);
}


function shipHit(ship,laser){
	var kill = this.sound.add('kill');
	
	laser.destroy();
	kill.play();

	if(score>5)
	{
		score -= 5;
	    scoreText.setText('Score: ' + score);
	}
	else
	{
		score=0;
		scoreText.setText('Score: ' + score);
	}
	
}



class GameScene extends Phaser.Scene
{
	constructor() {
		super("GameScene");
		this.ship;
		this.alienGroup;
		this.laserGroup;
		this.inputKeys;
		this.bass;
		
	}

	preload() {
		this.load.image('laser', './assets/laserBlue.png');
		this.load.image('laserAlien', './assets/laserRed.png');
		this.load.image('ship', './assets/ship.png');
		this.load.spritesheet("alien","./assets/alien.png",{frameWidth: 48,frameHeight: 32});
		this.load.audio('bass', [ './audio/blaster.ogg', './audio/blaster.mp3' ]);
		this.load.audio('explosion', [ './audio/explosion.ogg', './audio/explosion.mp3' ]);
		this.load.audio('ammo', [ './audio/ammo.ogg', './audio/ammo.mp3' ]);
		this.load.audio('outAmmo', [ './audio/outAmmo.ogg', './audio/outAmmo.mp3' ]);
		this.load.audio('gameOver', [ './audio/gameOver.ogg', './audio/gameOver.mp3' ]);
		this.load.audio('startGame', [ './audio/game.ogg', './audio/game.mp3' ]);
		this.load.audio('kill', [ './audio/kill.ogg', './audio/kill.mp3' ]);
		this.load.audio('shootDelay', [ './audio/Click1.wav' ]);
		
	}

	create() {
		load.stop();
		lobby.stop();
		//socket = io();
		this.bass = this.sound.add('bass');
	    startGame = this.sound.add('startGame');
		startGame.play();

		timedEvent = this.time.delayedCall(100000);
		

		scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '30px', fill: '#FFFF' });
		ammoText = this.add.text(16, 46, 'Ammo : 3', { fontSize: '30px', fill: '#FFFF' });
		timeText = this.add.text(16, 76, 'Time : 0.00', { fontSize: '30px', fill: '#FFFF' });
		modeText = this.add.text(250, 16, 'Mode: Easy', { fontSize: '30px', fill: '#FFFF' });
		classification = this.add.text(800, 16, 'Leaderboard', { fontSize: '30px', fill: '#FFFF' });
		pointText = this.add.text(800,60, '1.', { fontSize: '20px', fill: '#FFFF' });
		
		this.anims.create({
			key: "animateAlien",
			frames: this.anims.generateFrameNumbers("alien"),
			frameRate: 2,
			repeat: -1,
		});
		this.laserGroup = new LaserGroup(this);
		this.alienGroup = new AlienGroup(this);
		this.alienLaser = new AlienLaserGroup(this);

		this.addAliens();
		this.addShip();
		this.addEvents();
		this.physics.add.collider(this.alienGroup,this.laserGroup,removeAlien,null, this);
		this.physics.add.overlap(this.ship,this.alienLaser,shipHit,null, this);
	}
	addAliens(){
		const centerX = this.cameras.main.width / 2;
		const bottom = 100;

		var children = this.alienGroup.getChildren();
		var x = 18;
		var y = 100;
		for (var i = 0; i < children.length; i++){
			if(i%10 == 0){
				y = y + 50;
				x = 18;
			}
			x = x + 68;
			children[i].setPosition(x, y);
   		}
	}

	addShip() {
		const centerX = this.cameras.main.width / 2;
		const bottom = this.cameras.main.height;
		this.ship = this.physics.add.sprite(centerX, bottom - 90, 'ship');
		this.ship.setCollideWorldBounds(true);
	}

	reloadAmmo(event)
	{
		if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.R) {
			var ammoEffect = this.sound.add('ammo');	
			ammoEffect.play();
			ammo=3;
			ammoText.setText('Ammo : ' + ammo);
		}
	}
	addEvents() {
		this.input.on('pointermove', (pointer) => {
			if(pointer.x<=750)
			{
				this.ship.x = pointer.x;
			}
			
		});

		this.input.on('pointerdown', (pointer) => {
			var time = timedEvent.getProgress().toString().substr(0, 5);
			
			if(ammo>0)
			{
				if (time - lastLaserTime >0.005){
					lastLaserTime = time;
					ammo-=1;
					ammoText.setText('Ammo : ' + ammo);
					this.fireBullet();
					this.bass.play();
				}
				else{
					var shootDelay = this.sound.add('shootDelay');	
					shootDelay.play();
				}
			}
			if(ammo==0)
			{
				ammoText.setText('Ammo : ' + ammo+ '[press R to reload ]');
				var outAmmoEffect = this.sound.add('outAmmo');	
				outAmmoEffect.play();
			}
			
		});

		this.input.keyboard.on('keydown_R', this.reloadAmmo, this);
		
		socket.on('message', function(data){
			var i = 1;
			var Leaderboard = "";
			
			var ordered = {};
			Object.entries(data)
			.sort((a, b) => a[1] - b[1])
			.forEach(([key, val]) => {
				ordered[key] = val;
			});
			
			var tuples = [];
			for(var key in ordered) {
				
				
					if(ordered.hasOwnProperty(key)) {
						tuples.push([key, ordered[key]]);
						tuples.sort(function(a, b) {
							a = a[1];
							b = b[1];
						
							return a > b ? -1 : (a < b ? 1 : 0);
						});

					}
		}
		
			for (var i = 0; i < tuples.length; i++) 
			{
				var key = tuples[i][0];
				var value = tuples[i][1];
				
				Leaderboard = Leaderboard+(i+1)+'.  '+key+'\t'+value+"\n";
				
				
			}
			pointText.setText(Leaderboard);
		});
	}
	fireBullet() {
		this.laserGroup.fireBullet(this.ship.x, this.ship.y - 20);
	}
	update(time) {
		
		//socket.emit(socket.id,score);
		socket.emit(socket.id, {
			nickname: nickname.value,
			score: score,
			nameRoom: roomName.value
		  });
		if(timedEvent.getProgress().toString().substr(0, 4)<0.60)
		{
			timeText.setText('Time: ' + timedEvent.getProgress().toString().substr(0, 4));
		}
		if(timedEvent.getProgress().toString().substr(0, 4)==0.60)
		{
			if(timedEvent.getProgress().toString().substr(0, 4)==0.60)
		    {
				startGame.stop();
				this.scene.start('GameOver');
		    }
		}
		if(timedEvent.getProgress().toString().substr(0, 4)<0.20)
		{
			if(Math.round(time/100)%15 == 0){
				var random = Phaser.Math.Between(0, 49);
				var alienShoot = this.alienGroup.getChildren()[random];
				this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
			}
		}

		if(timedEvent.getProgress().toString().substr(0, 4)>=0.20 && timedEvent.getProgress().toString().substr(0, 4)<0.40)
		{
			if(Math.round(time/100)%10 == 0){
				modeText.setText('Mode: Indermediate');
				var random = Phaser.Math.Between(0, 49);
				var alienShoot = this.alienGroup.getChildren()[random];
				this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
			}
		}
		if(timedEvent.getProgress().toString().substr(0, 4)>=0.40 && timedEvent.getProgress().toString().substr(0, 4)<=0.60)
		{
			if(Math.round(time/100)%5 == 0){
				modeText.setText('Mode: Hard');
				var random = Phaser.Math.Between(0, 49);
				var alienShoot = this.alienGroup.getChildren()[random];
				this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
			}
		}
		
	}
}
class HomeScene extends Phaser.Scene {

    constructor ()
    {
        super('HomeScene');
    }
 
	preload() {
		this.load.image('background', './assets/background.jpg');
		this.load.audio('lobby', [ './audio/lobby.ogg', './audio/lobby.mp3' ]);
		this.load.html('login', './room.html');
		this.load.html('joinRoom', './joinRoom.html');
		this.load.html('description', './description.html');
		this.load.image('input2', './assets/input2.png');
		this.load.image('buttom', './assets/buttom.png');
		
		
	}
    create ()
    {
		socket = io();
        lobby = this.sound.add('lobby');
		lobby.play();	
		this.add.image(550,350,'background');
		this.add.image(200,150,'buttom');
		this.add.image(450,150,'buttom');
		image1=this.add.image(350,250,'input2');
		image2=this.add.image(350,350,'input2');
		image3=this.add.image(350,450,'input2');
		image4=this.add.image(350,570,'buttom');
		image5=this.add.image(350,470,'buttom');
        var createRoom = this.add.dom(400, 600).createFromCache('login');
		createRoom.addListener('click');

	    var joinRoom = this.add.dom(400, 600).createFromCache('joinRoom');
		joinRoom.addListener('click');

		//var description = this.add.dom(300, 400).createFromCache('description');
		
		
		
		image1.visible=true;
		image2.visible=true;
		image3.visible=true;
		image4.visible=true;
		image5.visible=false;
		
		
        createRoom.on('click', function (event) {
			
			
			if (event.target.name === 'createRoom')
			{
			    roomName = this.getChildByName('roomName');
			    nickname = this.getChildByName('nickname');
			    players = this.getChildByName('players');
			
				if(roomName.value != '' && nickname.value!=0)
				{
					socket.emit('createRoom',{
						name: roomName.value,
						nickname: nickname.value,
						numberPlayer: players.value
					});
					
					socket.on('players', function(data){
						nPlayer=data;
					});
					load=true;
					
				}
			}
			
			if (event.target.name === 'viewRoom')
			{
				
				formCreateRoom = this.getChildByName('createRoom');
				
				if(formCreateRoom.style.display === 'none')
				{
					formJoinRoom.style.display='none';
					formCreateRoom.style.display='block';
					image1.visible=true;
					image2.visible=true;
					image3.visible=true;
					image4.visible=true;
					image5.visible=false;
					
					
				}
				else
				{
					formCreateRoom.style.display='none';
					image1.visible=false;
					image2.visible=false;
					image3.visible=false;
					image4.visible=false;
				}
			}
	
		});
		
		joinRoom.on('click', function (event) {

			if (event.target.name === 'joinRoom')
			{
			    roomName = this.getChildByName('roomName');
			    nickname = this.getChildByName('nickname');
				
			    
			
				if(roomName.value != '' && nickname.value!=0)
				{
					socket.emit('joinRoom',{
						name: roomName.value,
						nickname: nickname.value
					});
					socket.on('players', function(data){
						nPlayer=data;
					});
					
					load=true;
					
				}
			}
			
			if (event.target.name === 'viewJoin')
			{
				
				formJoinRoom = this.getChildByName('joinRoom');
				if(formJoinRoom.style.display === 'none')
				{
					formCreateRoom.style.display='none';
					formJoinRoom.style.display='block';
					
					
					image1.visible=true;
					image2.visible=true;
					image3.visible=false;
					image4.visible=false;
					
					image5.visible=true;
					
				}
				
				else
				{
					formJoinRoom.style.display='none';
					image1.visible=false;
					image2.visible=false;
					formCreateRoom.style.display='none';
					image5.visible=false;
				}
			}
	
		});
		
    }
	update()
	{

		if(load===true)
		{
			this.scene.start('LoadScene');
		}
	}
}
class LoadScene extends Phaser.Scene {

    constructor ()
    {
        super('LoadScene');
    }
 
	preload() {
	
		this.load.image('back', './assets/backLoad.png');
		this.load.audio('load', [ './audio/loading.ogg', './audio/loading.mp3' ]);
	}
	
    create ()
    {	
		load = this.sound.add('load');
		timeLoad = this.time.delayedCall(100000);
		lobby.stop();
		load.play();	
		this.add.image(400,350,'back');
		loadText = this.add.text(16, 16, 'Wait other players. Remaining player: '+nPlayer, { fontSize: '30px', fill: '#FFFF' });
		countDownText = this.add.text(400, 300, '3', { fontSize: '120px', fill: '#FFFF' });
			
    }
	update()
	{
		loadText.setText('Wait other players. Remaining player: '+nPlayer);
			
		if(nPlayer === 0)
		{
			
			
				countDownText.setText('GO!');
				this.scene.start('GameScene');
			
		}
		
		
	}
}
class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('GameOver');
    }
 
	preload() {
		this.load.audio('gameOver', [ './audio/gameOver.ogg', './audio/gameOver.mp3' ]);
	}
    create ()
    {
        var gameOver = this.sound.add('gameOver');	
		
		scoreText = this.add.text(16, 16, 'Score: '+score, { fontSize: '32px', fill: '#FFFF' });
		gameOverText = this.add.text(200, 300, 'GAME OVER', { fontSize: '80px', fill: '#FF0000' });
        gameOver.play();
		const helloButton = this.add.text(600, 600, 'Return homePage', { fill: '#FF0000' });
    	helloButton.setInteractive();

    	helloButton.on('pointerdown', () => { this.scene.start('GameScene'); });
        
    }
}
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	dom: {
        createContainer: true
    },
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 0 },
			enableBody: true
		}
	},
  scale: {
    parent: 'container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 700
  } ,
	scene: [HomeScene,LoadScene,GameScene,GameOver]
};

const game = new Phaser.Game(config);