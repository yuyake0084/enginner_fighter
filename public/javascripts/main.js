const serviceName = 'Enginner Fighter';
const thisServer = 'http://localhost:3000/';
const socket = io.connect(thisServer);

const screen_width = 640;
const screen_height = 290;
const player02_width = 80;
const player02_height = 80;
const player01_image = thisServer + 'images/player01.gif';
const player02_image = thisServer + 'images/player02.gif';
const bg_battle_image01 = thisServer + 'images/bg_battle01.jpg';

const assets = [
	player01_image,
	player02_image,
	bg_battle_image01
];

let player01;

// const name = window.prompt('ユーザー名を入力してください');

const playerInfo = {
	id: '',
	loginName: 'イギー',
	x: screen_width / 5,
	y: 220,
	settingFile: `${thisServer}data/player01.json`,
	img: `${thisServer}images/main.png`
};
const player = null;
const otherPlayers = {};

enchant();

// 繋がった時の処理
socket.on('connect', () => {

	Push.create('Enginner Fighter', {
		body: `${playerInfo.loginName}がログインしました。`,
		icon: {
			x32: `${playerInfo.img}`
		},
		timeout: 3000
	});

	playerInfo.id = socket.id;

	socket.emit('name', playerInfo);
});

window.onload = () => {

	if (window.GamepadEvent) {
		window.addEventListener('gamepadconnected', e => {
			console.log("ゲームパッドが接続されました。");
			console.log(e.gamepad);
		});
	}

	const gamepad = navigator.getGamepads && navigator.getGamepads()[0];


	function errorLog() {
		console.log("Fail!");
		console.log(XMLHttpRequest.status);
		console.log(textStatus);
	}


	const game = new Game(screen_width, screen_height);
	game.preload(assets);
	game.fps = 30;
	game.keybind(32, 'space');
	game.keybind(65, 'a');
	game.onload = () => {

		const root = game.rootScene;
		const input = game.input;
		const player_speed = 15;

		const LifeP1 = new Entity();
		LifeP1.width = screen_width / 2 - 10;
		LifeP1.height = 20;
		LifeP1.x = 10;
		LifeP1.y = 10;
		LifeP1.backgroundColor = '#27e4b2';

		const LifeP2 = new Entity();
		LifeP2.width = -screen_width / 2 + 10;
		LifeP2.height = 20;
		LifeP2.x = screen_width - 10;
		LifeP2.y = 10;
		LifeP2.backgroundColor = '#27e4b2';

		let scene = new Scene();
		let bg = new Sprite(screen_width, screen_height);
		bg.image = game.assets[bg_battle_image01];
		bg.x = 0;
		bg.y = 0;

		socket.on('name', otherPlayerInfo => {

			let id = otherPlayerInfo.id;
			const otherPlayer = otherPlayers[id] = new Sprite(64, 64);
			otherPlayer.id = id;
			otherPlayer.x = 0;
			otherPlayer.y = 0;

			otherPlayer.setPosition = pos => {
				otherPlayer.x = pos.x;
				otherPlayer.y = pos.y;
				otherPlayer.frame = pos.frame;
			}
			otherPlayer.setPosition.bind(otherPlayerInfo);

			socket.on('pushRight01:' + id, pos => {
				otherPlayer.setPosition.bind(pos);
				console.log(otherPlayer.setPosition.otherPlayer.x);
			});
		});

		 // // ジャンプ
	  // socket.on('pushUp01', () => {
	  //   socket.broadcast.emit('pushUp01');
	  // });

	  // // 右に移動
	  // socket.on('pushRight01', pos => {
	  //   var playerInfo = playerInfos[socket.id];
	  //   if (!playerInfo) {
	  //     return;
	  //   }
	  //   console.log(`id: ${playerInfo.id}, name: ${playerInfo.loginName}, x: ${pos.x}, y: ${pos.y}, frame: ${pos.frame}`);
	  //   socket.broadcast.emit('pushRight01');
	  // });

	  // socket.on('pushDown01', () => {
	  //   socket.broadcast.emit('pushDown01');
	  // });

	  // socket.on('pushLeft01', () => {
	  //   socket.broadcast.emit('pushLeft01');
	  // });


		const Player01 = Class.create(Sprite, {
			initialize: function(playerInfo) {
				let ground = 220;
				let preInput = false;
				let jump = false;

				Sprite.call(this, 64, 64);
				this.playerInfo = playerInfo;
				this.setSettingFile(playerInfo.settingFile);
				this.image = game.assets[player01_image];
				this.scaleX = -1;
				this.x = this.playerInfo.x;
				this.y = this.playerInfo.y;
				// 名前
				this.loginName = new Label(this.playerInfo.loginName);
				this.loginName.width = 100;
				this.loginName.color = 'black';
				this.loginName.x = this.x + 10;
				this.loginName.y = this.y - 15;
				this.frame = 0;
				this.on('enterframe', () => {
					let tempy = this.y;
					let gravity = 1.0;

					this.frame = 0;
					this.scaleX = -1;

					if (input.up && !preInput && !jump) {
						socket.emit('pushUp01');
					  gravity = -12.0;
					  jump = true;

					  this.loginName.y = this.y - 15;
					}
					if (input.right) {
						this.x += player_speed;
						this.loginName.x += player_speed;
						this.frame = this.age % 2 + 2;
						socket.emit('pushRight01', {
							x: this.x,
							frame: this.frame
						});
					}
					if (input.down) {
						socket.emit('pushDown01');
						this.frame = 8;
					}
					if (input.left) {
						socket.emit('pushLeft01');
						this.scaleX = 1;
						this.x -= player_speed;
						this.loginName.x -= player_speed;
						this.frame = this.age % 2 + 2;
					}

					this.y += (this.y - ground) + gravity;

					if (this.y > 220) {
						this.y = 220;
						jump = false;
					}

					ground = tempy;
					preInput = input.up;


					let [left, top] = [0, 0];
					let [right, bottom] = [screen_width - this.width, screen_height - this.heigh];

					if (this.x < left || this.loginName.x < left) {
						this.x = left;
						this.loginName.x = left;
					} else if (this.x > right || this.loginName.x > right) {
						this.x = right;
						this.loginName.x = right;
					}
					if (this.y < top || this.loginName.y < top) {
						this.y = top;
						this.loginName.y = top;
					} else if (this.y > bottom || this.loginName.y > bottom) {
						this.y = bottom;
						this.loginName.y = bottom;
					}
				});

				return this;
			},
			setSettingFile: function(settingFile) {
				this.settingFile = settingFile;
				let core = enchant.Core.instance;
				if (core.assets[this.settingFile]) {
					this.setSetting(core.assets[this.settingFile]);
				}
			},
			setSetting: function(setting) {
				let info = JSON.parse(setting);

				this.width = info.width;
				this.height = info.height;
				this.x = info.x;
				this.y = info.y;
				console.log(this.x);
				this.setImage(info.image);
			},
			attack: function() {
				this.frame = this.age % 3 + 4;
				console.log(player01);
			}
		});

		const Attack01 = Class.create(Sprite, {
			initialize: function(x, y) {
				sprite.call(this, 64, 64);
				this.destroy = false;
				this.x = x;
				this.y = y;
				this.on('enterframe', () => {
					if (game.input.a) {
						Attack01Fuc();
					}
					console.log(Attack01);
				});
			}
		});

		class Player03 {
			constructor(x, y) {
				const player03_img = new Image();
				player03_img.src = 'http://localhost:3000/images/bigmonster2.gif';
				this.x = x;
				this.y = y;
				this.width = 254;
				this.height = 254;
				this.image = game.assets[player01_image];
				this.frame = 0;
			}
		}

		const Player02 = Class.create(Sprite, {
			initialize: function(x, y) {
				Sprite.call(this, 64, 64);
				this.image = game.assets[player02_image];
				let p01_image = this.image;
				this.x = x;
				this.y = y;
				this.scaleX = 1;
				this.frame = 0;
				this.on('enterframe', () => {
					this.frame = this.direction * 3 + this.walk;
				});
			}
		});

		function Attack01Fuc() {
			const attack01 = new Attack01();
			root.addChild(attack01);
			console.log(attack01);
		}

		function topScene() {
			let scene = new Scene();
			let bg = new Sprite(screen_width, screen_height);

			return scene;
		}


		function battleScene() {
				root.addChild(bg);
				root.addChild(LifeP1);
				root.addChild(LifeP2);

				player01 = new Player01(playerInfo);
				root.addChild(player01);
				root.addChild(player01.loginName);

				const player02 = new Player02(screen_width / 1.5, 220);
				root.addChild(player02);

				const player03 = new Player03(screen_width / 2, 100);

				if (player01.x > player02.x) {
					player01.scaleX = 1;
					console.log(player01);
				}
			return scene;
		}

		game.rootScene.on('enterframe', () => {

			topScene();

			if (game.input.space) {
				battleScene();
			}
		});
	};
	game.start();
};