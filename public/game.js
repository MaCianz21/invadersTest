import {Laser,LaserGroup} from './entity/laser.js';
import {Alien,AlienGroup,AlienLaserGroup} from './entity/alien.js';
var textfinish;
var load;
var nAlien=50;
var gameOverText;
var score = 0;
var scoreText;
var ammo = 3;
var cursors;
var ammoText;
var timeText;
var timedEvent;
var lastLaserTime = 0;
var Leaderboard;
var stopEffect=false;
var tied = false;
var startGame;
var load3=false;
var modeText;
var modalTextNickname;
var modalTextRoom;
var backBattle;
var mex;
var tuples= [];
var socket = io();
var comment;
var finalPoints;
var formChat;
var Chat;
var checkChat=false;
var countDownText;
var pointText;
var loadText;
var nPlayer;
var image1;
var image2;
var image3;
var image4;
var image5;
var image6;
var image7;
var image8;
var formCreateRoom;
var formJoinRoom;
var lobby;
var load1=false;
var load2=false;
var nickname;
var roomName;
var players;
var formJoinChat;
var playerNumber;
var gameEnd = false;
var leftLimit = 50;
var rightLimit = 750;
var movementX=0.5;
var speedUpAlienI;
var speedUpAlienH;

//handler for the collision between alien and projectiles(user)
function removeAlien(alien,laser){
	nAlien= nAlien-1;
	var explosion = this.sound.add('explosion');	
	alien.disableBody(true,true);
	laser.hit();
	explosion.play();
	score += 10;
	scoreText.setText('Score: ' + score);
}

//handler for the collision between ship and projectiles(alien)
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
//scene that contains the game logic
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
		this.load.image('text', './assets/textLeaderboard.png');
		this.load.image('first', './assets/first.png');
		this.load.image('laserAlien', './assets/laserRed.png');
		this.load.image('backBattle', './assets/backBattle.png');
		this.load.image('lB1', './assets/lB1.png');
		this.load.image('lB2', './assets/lB2.png');
		this.load.image('lB3', './assets/lB3.png');
		this.load.image('lB4', './assets/lB4.png');
		this.load.image('backLeaderboard', './assets/leaderBoard.png');
		this.load.image('ship', './assets/ship2.png');
		this.load.spritesheet("alien","./assets/alien2.png",{frameWidth: 48,frameHeight: 32});
		this.load.audio('bass', [ './audio/blaster.ogg', './audio/blaster.mp3' ]);
		this.load.audio('explosion', [ './audio/explosion.ogg', './audio/explosion.mp3' ]);
		this.load.audio('ammo', [ './audio/ammo.ogg', './audio/ammo.mp3' ]);
		this.load.audio('outAmmo', [ './audio/outAmmo.ogg', './audio/outAmmo.mp3' ]);
		this.load.audio('startGame', [ './audio/game.ogg', './audio/game.mp3' ]);
		this.load.audio('kill', [ './audio/kill.ogg', './audio/kill.mp3' ]);
		this.load.audio('shootDelay', [ './audio/Click1.wav' ]);
	}

	create() {
		cursors = this.input.keyboard.createCursorKeys();
		load.stop();
		lobby.stop();
		this.bass = this.sound.add('bass');
	    startGame = this.sound.add('startGame');
		startGame.play();
		timedEvent = this.time.delayedCall(100000);
		scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '30px', fill: '#FFFF' });
		ammoText = this.add.text(16, 46, 'Ammo : 3', { fontSize: '30px', fill: '#FFFF' });
		timeText = this.add.text(16, 76, 'Time : 0.00', { fontSize: '30px', fill: '#FFFF' });
		modeText = this.add.text(500, 16, 'Mode: Easy', { fontSize: '30px', fill: '#FFFF' });
		textfinish = this.add.text(80, 300, '', { fontSize: '40px', fill: '#FFFF' });
		pointText = this.add.text(874,260, '1 ', { fontSize: '20px', fill: 'black' });	
		speedUpAlienI = true;
		speedUpAlienH = true;
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
	    backBattle = this.add.tileSprite(400,400, 800, 590, "backBattle");
		backBattle.setDepth(-1);
		var backLeaderboard = this.add.tileSprite(1050,500, 500, 800, "backLeaderboard");
		backLeaderboard.setDepth(-1);
		gameEnd = false;
		//handler for game end
		socket.on("roomFinish",function(tmp){
			if(tmp){
				startGame.stop();
				gameEnd = true;
			}
		});
		switch(playerNumber){
			case 1:
				var leaderB=this.add.image(1000,400,'lB1');
				leaderB.setDepth(-1);
				break;
			case 2:
				var leaderB=this.add.image(1000,400,'lB2');
				leaderB.setDepth(-1);
				break;
			case 3:
				var leaderB=this.add.image(1000,400,'lB3');
				leaderB.setDepth(-1);
				break;
			case 4:
				var leaderB=this.add.image(1000,400,'lB4');
				leaderB.setDepth(-1);
				break;
			default:
				break;
		}
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
	reloadAmmo(event){
		if(stopEffect===false){
			var ammoEffect = this.sound.add('ammo');	
			ammoEffect.play();
			if(score >2 ){
				if(ammo<3){
					score = score-2;
				    scoreText.setText('Score: ' + score);
				}
			}
			else{
				score = 0;
				scoreText.setText('Score: ' + score);
			}
			ammo=3;
			ammoText.setText('Ammo : ' + ammo);
		}
	}
	addEvents() {
		//handler for the movement of the ship
		this.input.on('pointermove', (pointer) => {
			if(pointer.x >=80 && pointer.x<=705){
				this.ship.x = pointer.x;
			}
		});

		
		//handler for the shoot of the projectile
		this.input.on('pointerdown', (pointer) => {
			if(stopEffect===false){
				var time = timedEvent.getProgress().toString().substr(0, 5);
				if(ammo>0){
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
				if(ammo==0){
					ammoText.setText('Ammo : ' + ammo+ '[reload mandatory!]');
					var outAmmoEffect = this.sound.add('outAmmo');	
					outAmmoEffect.play();
				}
			}
		});

		this.input.keyboard.on('keydown_R', this.reloadAmmo, this);

		//handler for the leaderboard update
		socket.on('message', function(data){
			var i = 1;
		    Leaderboard = "";
		    tuples = [];
			delete data.players;
			for(var key in data) {
				if(data.hasOwnProperty(key)) {
					tuples.push([key, data[key]]);
					tuples.sort(function(a, b) {
						a = a[1];
						b = b[1];
						return a > b ? -1 : (a < b ? 1 : 0);
					});
				}
			}
		
			for (var i = 0; i < tuples.length; i++) {
				var key = tuples[i][0];
				var value = tuples[i][1];
				switch(key.length){
					case 1:
						key=key+'      ';
						break;
					case 2:
						key=key+'     ';
						break;
					case 3:
						key=key+'    ';
						break;
					case 4:
						key=key+'   ';
						break;
					case 5:
						key=key+'  ';
						break;
					case 6:
						key=key+' ';
						break;
					default:
						break;
				}
				if(i===0){
					Leaderboard ='    '+key+'\t     '+value+"\n\n\n";
				}
				else{
					Leaderboard = Leaderboard+(i+1)+'   '+key+'\t     '+value+"\n\n\n";
				}
			}
			pointText.setText(Leaderboard);
		});
	}
	fireBullet() {
		this.laserGroup.fireBullet(this.ship.x, this.ship.y - 20);
	}
	update(time) {
		var currentLeftLimit = 100;
		var currentRightLimit = 750;

		if(cursors.right.isDown){
			if(this.ship.x <= 705){
				this.ship.x += 3;
			}
		}
		if(cursors.left.isDown){
			if(this.ship.x >= 80){
				this.ship.x -= 3;
			}
		}
		
		if(cursors.down.isDown){
			this.reloadAmmo();
		}
		if (cursors.up.isDown){
			if(stopEffect===false){
				var timerShot = timedEvent.getProgress().toString().substr(0, 5);
				if(ammo>0){
					if (timerShot - lastLaserTime >0.005){
						lastLaserTime = timerShot;
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
				if(ammo==0){
					ammoText.setText('Ammo : ' + ammo+ '[reload mandatory!]');
					var outAmmoEffect = this.sound.add('outAmmo');	
					outAmmoEffect.play();
				}
			}
		}

		//calulating the first column of aliens that are alive from the left
		for(var i=0;i<10;i++){
			var check = true;
			for(var j=0;j<5;j++){
				if(this.alienGroup.getChildren()[i+(j*10)].visible){
					check = false;
				}
			}
			if(!check){
				//the i-column contains aliens, memorize the position of the alien that is alive
				currentLeftLimit = this.alienGroup.getChildren()[i*1].x;
				break;
			}
		}

		//calulating the first column of aliens that are alive from the right
		for(var i=9;i>(-1);i--){
			var check = true;
			for(var j=0;j<5;j++){
				if(this.alienGroup.getChildren()[i+(j*10)].visible){
					check = false;
				}
			}
			if(!check){
				//the i-column contains aliens, memorize the position of the alien that is alive
				currentRightLimit = this.alienGroup.getChildren()[i*1].x;
				break;
			}
		}

		//movement -> left
		if(currentLeftLimit <= leftLimit){
			movementX = movementX*(-1);
		}
		
		//movement -> right
		if(currentRightLimit >= rightLimit){
			movementX = movementX*(-1);
		}
		
		//render the movement
		for(var i=0;i<50;i++){
			this.alienGroup.getChildren()[i].x += movementX;
		}
		//emits the score of the player
		socket.emit(socket.id, {
			nickname: nickname.value,
			score: score,
			nameRoom: roomName.value
		});
		//change scene if the gameEnd(that is set by a handler) is true
		if(gameEnd){
			this.scene.start('GameOver');
		}
		//checks if the player has finished the game before the time limit, and if the other players are still playing
		if(timedEvent.getProgress().toString().substr(0, 4)<0.60){
			timeText.setText('Time: ' + timedEvent.getProgress().toString().substr(0, 4));
			if(nAlien==0){
				if(playerNumber==1){
					socket.emit('playerFinish',{
						roomName: roomName.value,
						nickname: nickname.value
					});
					stopEffect=true;
					startGame.stop();
				}
				else{
					stopEffect=true;
					textfinish.setText('Wait for the end of the game');
				}
			}
		}
		//checks if the time has reached the limit, and if the other players are still playing
		if(timedEvent.getProgress().toString().substr(0, 4)>=0.60){
			timeText.setText('Time:  1.00');
			if(playerNumber!=1){
				stopEffect=true;
				startGame.stop();
				textfinish.setText('Wait for the end of the game');
			}
			
			socket.emit('playerFinish',{
				roomName: roomName.value,
				nickname: nickname.value
			});
			
			backBattle.tilePositionY -= 3;
		}
		//checks the time and changes game parameters like movement speed of the aliens(Easy mode)
		if(timedEvent.getProgress().toString().substr(0, 4)<0.20){
			backBattle.tilePositionY -= 1;
			if(Math.round(time/100)%15 == 0){
				var random = Phaser.Math.Between(0, 49);
				var alienShoot = this.alienGroup.getChildren()[random];
				if(alienShoot.visible === true){
					this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
				}
			}
		}
		//checks the time and changes game parameters like movement speed of the aliens(Indermediate mode)
		if(timedEvent.getProgress().toString().substr(0, 4)>=0.20 && timedEvent.getProgress().toString().substr(0, 4)<0.40){
			backBattle.tilePositionY -= 2;
			if(Math.round(time/100)%10 == 0){
				modeText.setText('Mode: Indermediate');
				if(speedUpAlienI){
					speedUpAlienI = false;
					movementX = movementX*2;
				}
				var random = Phaser.Math.Between(0, 49);
				var alienShoot = this.alienGroup.getChildren()[random];
				if(alienShoot.visible === true){
					this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
				}
			}
		}
		//checks the time and changes game parameters like movement speed of the aliens(hard mode)
		if(timedEvent.getProgress().toString().substr(0, 4)>=0.40 && timedEvent.getProgress().toString().substr(0, 4)<=0.60)
		{
			backBattle.tilePositionY -= 3;
			if(Math.round(time/100)%5 == 0){
				modeText.setText('Mode: Hard');
				if(speedUpAlienH){
					speedUpAlienH = false;
					movementX = movementX*2;
				}
				var random = Phaser.Math.Between(0, 49);
				var alienShoot = this.alienGroup.getChildren()[random];
				if(alienShoot.visible === true){
					this.alienLaser.fireBullet(alienShoot.x,alienShoot.y);
				}
			}
		}
		
	}
}
//scene that contains the home page GUI
class HomeScene extends Phaser.Scene {

    constructor ()
    {
        super('HomeScene');
    }
 
	preload() {
		this.load.image('background', './assets/bkg2.jpg');
		this.load.image('backChat', './assets/chat.png');
		this.load.image('send', './assets/send.png');
		this.load.audio('lobby', [ './audio/lobby.ogg', './audio/lobby.mp3' ]);
		this.load.html('login', './room.html');
		this.load.html('joinRoom', './joinRoom.html');
		this.load.html('joinChat', './joinChat.html');
		this.load.html('description', './description.html');
		this.load.html('chat', './chat.html');
		this.load.image('input2', './assets/input2.png');
		this.load.image('buttom', './assets/buttom.png');
	}
    create (){
		modalTextRoom = this.add.text(200, 373, '', { fontSize: '14px', fill: 'white' });
		modalTextNickname = this.add.text(200, 474, '', { fontSize: '14px', fill: 'white' });
		modalTextRoom.setDepth(1);
		modalTextNickname.setDepth(1);
        lobby = this.sound.add('lobby');
		lobby.play();	
		var description = this.add.dom(320, 410).createFromCache('description');
		this.add.image(550,350,'background');
		this.add.image(200,190,'buttom');
		this.add.image(450,190,'buttom');
		this.add.image(320,137,'buttom');
		image1=this.add.image(350,270,'input2');
		image2=this.add.image(350,370,'input2');
		image3=this.add.image(350,470,'input2');
		image4=this.add.image(350,590,'buttom');
		image5=this.add.image(350,490,'buttom');
		image6=this.add.image(350,390,'buttom');
		image8=this.add.image(330,450,'backChat');
		image7=this.add.sprite(510,546,'send').setInteractive();
        var createRoom = this.add.dom(400, 600).createFromCache('login');
		createRoom.addListener('click');
	    var joinRoom = this.add.dom(400, 600).createFromCache('joinRoom');
		joinRoom.addListener('click');
		var joinChat = this.add.dom(400, 600).createFromCache('joinChat');
		joinChat.addListener('click');
	    Chat = this.add.dom(400, 600).createFromCache('chat');
		Chat.addListener('click');
		formCreateRoom = createRoom.getChildByName('createRoomForm');
		formJoinRoom = joinRoom.getChildByName('joinRoomForm');
		formJoinChat = joinChat.getChildByName('createNickname');
		formChat = Chat.getChildByName('chat');
		comment = Chat.getChildByName('comment');
		image1.visible=true;
		image2.visible=true;
		image3.visible=true;
		image4.visible=true;
		image5.visible=false;
		image6.visible=false;
		image7.visible=false;
		image8.visible=false;
		comment.value="";
		//handler for the global chat messages
		socket.on('chat_update', function(data){
			if(data === 'exist'){
				modalTextRoom.setText('Nickname '+nickname.value+' already exist');
			}
			else{
				if(checkChat===true){
					image1.visible=false;
					image6.visible=false;
					formJoinChat.style.display='none';	
					formChat.style.display = 'block';
					image7.visible=true;
					image8.visible=true;
				}
				
				comment.value += '['+data.nickname+']'+ data.mex +'        '+data.time+'\n';
			}
		});
		//handler for the click the button that sends a message
		Chat.on('click', function (event) {
			mex = this.getChildByName('usermsg');
			image7.on('pointerdown', function (pointer) {
				if(mex.value !=''){
					socket.emit('mex',{
						nickname: nickname.value,
						mex: mex.value
					});
				   	mex.value='';
				}
			});
			
		});
		//handler for the button for joining the chat
		joinChat.on('click', function (event) {
			if (event.target.name === 'viewChat'){
				nickname = this.getChildByName('nickname');
				if(formJoinChat.style.display === 'none'){
					if(nickname.value === ''){
						formJoinRoom.style.display='none';
						formCreateRoom.style.display='none';
						formJoinChat.style.display='block';
						formChat.style.display = 'none';
						image1.visible=true;
						image2.visible=false;
						image3.visible=false;
						image4.visible=false;
						image5.visible=false;
						image6.visible=true;
						image7.visible=false;
						image8.visible=false;
						modalTextNickname.setText('');
					    modalTextRoom.setText('');
					}
					else{
						image2.visible=false;
						image3.visible=false;
						image4.visible=false;
						image5.visible=false;
						formJoinRoom.style.display='none';
						formCreateRoom.style.display='none';
						image1.visible=false;
						image6.visible=false;
						formJoinChat.style.display='none';
						formChat.style.display = 'block';
						image7.visible=true;
						image8.visible=true;
						modalTextNickname.setText('');
					    modalTextRoom.setText('');
					}
				}
			}
			
			if (event.target.name === 'joinChatRoom'){
				checkChat=true;
				//joining the global chat
				nickname = this.getChildByName('nickname');
				if(nickname.value===''){
					modalTextRoom.setText('Insert nickname');
				}
				else{
					socket.emit('userJoin',{
						nickname: nickname.value
					});
				}	
			}
		});
		//handler for the button for the creation of a room
        createRoom.on('click', function (event) {
			if (event.target.name === 'createRoom'){
			    roomName = this.getChildByName('roomName');
			    nickname = this.getChildByName('nickname');
			    players = this.getChildByName('players');
			
				if(roomName.value === ''){
					modalTextRoom.setText('Insert room name');
				}

				if(nickname.value === ''){
					modalTextNickname.setText('Insert nickname');
				}
				if(roomName.value != '' && nickname.value!=0){
					socket.emit('createRoom',{
						name: roomName.value,
						nickname: nickname.value,
						numberPlayer: players.value
					});
					
					socket.on('nickname', function(data){
						if(data==='exist'){
							modalTextNickname.setText('Nickname '+nickname.value+' already exists');
						}
						else{
							load1=true;
							load3=true;
						}
					});

					socket.on('checkRoom_create', function(data){
						if(data==='exist'){
							modalTextRoom.setText('Room '+roomName.value+' already exists');
						}
						else{
							load2=true;
							load3=true;
						}
					});

					socket.on('players', function(data){
						nPlayer=data
					});
					
					
				}
			}
			
			if (event.target.name === 'viewRoom'){
				checkChat=false;
				if(formCreateRoom.style.display === 'none'){
					formJoinRoom.style.display='none';
					formCreateRoom.style.display='block';
					formJoinChat.style.display='none';
					formChat.style.display = 'none';
					image1.visible=true;
					image2.visible=true;
					image3.visible=true;
					image4.visible=true;
					image5.visible=false;
					image6.visible=false;
					image7.visible=false;
					image8.visible=false;
					modalTextNickname.setText('');
					modalTextRoom.setText('');
				}
			}
		});
		//handler for the button for joining a room
		joinRoom.on('click', function (event) {
			if (event.target.name === 'joinRoom'){
			    roomName = this.getChildByName('roomName');
			    nickname = this.getChildByName('nickname');
				if(roomName.value === ''){
					modalTextRoom.setText('Insert room name');
				}
				if(nickname.value === ''){
					modalTextNickname.setText('Insert nickname');
				}
				if(roomName.value != '' && nickname.value!=0){
					socket.emit('joinRoom',{
						name: roomName.value,
						nickname: nickname.value
					});
					
					socket.on('nickname', function(data){
						if(data==='exist'){
							modalTextNickname.setText('Nickname '+nickname.value+' already exists');	
						}
						else{
							load1=true;
						}
					});

					socket.on('checkRoom_join', function(data){
						if(data==='exist'){
							load2=true;
						}
						else{
							modalTextRoom.setText('Room '+roomName.value+' does not exist');
						}
					});

					socket.on('checkPlayer', function(data){
						if(data!='prohibited'){
							load3=true;
						}
						else{
							modalTextRoom.setText('Max number of players reached');
						}
					});

					socket.on('players', function(data){
						nPlayer=data;
					});
				}
			}
			
			if (event.target.name === 'viewJoin'){
				checkChat=false;
				if(formJoinRoom.style.display === 'none'){
					formCreateRoom.style.display='none';
					formJoinRoom.style.display='block';
					formJoinChat.style.display='none';
					formChat.style.display = 'none';
					image1.visible=true;
					image2.visible=true;
					image3.visible=false;
					image4.visible=false;
					image5.visible=true;
					image6.visible=false;
					image7.visible=false;
					image8.visible=false;
					modalTextNickname.setText('');
					modalTextRoom.setText('');	
				}
			}
		});
    }
	update(){
		if(load1===true && load2===true && load3===true){
			socket.emit("gameStart",{
				name: roomName.value,
				socket: socket.id
			});
			this.scene.start('LoadScene');
		}
	}
}
//scene that contains the loading scene
class LoadScene extends Phaser.Scene {

    constructor ()
    {
        super('LoadScene');
    }

	preload() {
	
		this.load.image('back', './assets/backLoad.png');
		this.load.audio('load', [ './audio/loading.ogg', './audio/loading.mp3' ]);
	}
	
    create (){	
		load = this.sound.add('load');
		lobby.stop();
		load.play();	
		this.add.image(400,350,'back');
		loadText = this.add.text(16, 16, 'Wait for the other players. Remaining player: '+nPlayer, { fontSize: '30px', fill: '#FFFF' });
		countDownText = this.add.text(400, 300, '', { fontSize: '120px', fill: '#FFFF' });
		socket.on('displayLB_response', function(data){
			playerNumber = data.roomCapacity;
		});
    }
	update()
	{
		//update of the nPlayer value for the remaining players needed to start the game
		loadText.setText('Wait for the other players. Remaining player: '+nPlayer);
		if(nPlayer === 0){
			socket.emit('displayLB',{
				name: roomName.value
			});
			countDownText.setText('GO!');
			this.scene.start('GameScene');
		}
	}
}
//scene that contains the game over scene
class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('GameOver');
    }
 
	preload() {
		this.load.audio('lose', [ './audio/lose.ogg', './audio/lose.mp3' ]);
		this.load.audio('win', [ './audio/win.ogg', './audio/win.mp3' ]);
		this.load.image('lB1', './assets/lB1.png');
		this.load.image('lB2', './assets/lB2.png');
		this.load.image('lB3', './assets/lB3.png');
		this.load.image('lB4', './assets/lB4.png');
		this.load.image('backLeaderboard', './assets/leaderBoard.png');
		this.load.image('gameWin', './assets/win.png');
		this.load.image('gameLose', './assets/lose.png');
		this.load.image('buttom', './assets/buttom.png');
	}
    create (){
		socket.removeAllListeners("chat_update");
		finalPoints = this.add.text(874,260, '', { fontSize: '20px', fill: 'black' });
		finalPoints.setText(Leaderboard);
		this.add.image(600,600,'buttom');
		var backLeaderboard = this.add.tileSprite(1050,500, 500, 800, "backLeaderboard");
		backLeaderboard.setDepth(-1);
		switch(playerNumber){
			case 1:
				var leaderB=this.add.image(1000,400,'lB1');
				leaderB.setDepth(-1);
				break;
			case 2:
				var leaderB=this.add.image(1000,400,'lB2');
				leaderB.setDepth(-1);
				break;
			case 3:
				var leaderB=this.add.image(1000,400,'lB3');
				leaderB.setDepth(-1);
				break;
			case 4:
				var leaderB=this.add.image(1000,400,'lB4');
				leaderB.setDepth(-1);
				break;
			default:
				break;
		}
        var lose = this.sound.add('lose');
		var win = this.sound.add('win');	
		//play a different sound and displays game over text according to the player's ranking
		if(playerNumber==1){
			var gameWin=this.add.image(365,300,'gameWin');
			gameOverText = this.add.text(295, 335, 'YOU WIN', { fontSize: '30px', fill: 'white' });
			win.play();
		}
		else{
			if(tuples[0][0] == nickname.value && tuples[0][1]!= tuples[1][1]){
				var gameWin=this.add.image(365,300,'gameWin');
				gameOverText = this.add.text(295, 335, 'YOU WIN', { fontSize: '30px', fill: 'white' });
				win.play();
			}
			else{
				if(tuples[0][0] == nickname.value && tuples[0][1]== tuples[1][1]){
					var gameLose=this.add.image(365,440,'gameLose');
					gameOverText = this.add.text(295, 335, 'YOU TIED', { fontSize: '30px', fill: 'white' });
					lose.play();
				}
				else{
					for(var i=1;i<tuples.length;i++){
						if(tuples[i][0]==nickname.value && tuples[i][1] == tuples[0][1]){
							var gameLose=this.add.image(365,440,'gameLose');
							gameOverText = this.add.text(295, 335, 'YOU TIED', { fontSize: '30px', fill: 'white' });
							lose.play();
							tied=true;
						}
					}
					if(tied==false){
						var gameLose=this.add.image(365,440,'gameLose');
						gameOverText = this.add.text(295, 335, 'YOU LOSE', { fontSize: '30px', fill: 'white' });
						lose.play();
					}
				}
			}
		}
		//creates a button to return to the home page, and resets all the game variables
		const homePageButton = this.add.text(527, 638, 'Return homePage', { fill: 'lightblue' });
    	homePageButton.setInteractive();
		homePageButton.on('pointerdown', function (pointer) {
			socket.emit('playerGameOver', {
				nameRoom: roomName.value
			});
			Leaderboard='';
			nAlien=50;
			lastLaserTime=0;
			stopEffect=false;
			score=0;
			ammo=3;
			load1=false;
			load2=false;
			load3=false;
			nickname='';
			movementX=0.5;
            this.scene.start('HomeScene');
        }, this);
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