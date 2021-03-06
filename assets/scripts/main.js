function main() {

	function setupSettings() {

		const Settings = new Storage('settings', window.localStorage);

		let settingsPane = document.getElementById('settings');
		let themeCheckbox = settingsPane.querySelector('#theme-switch input[type=checkbox]');

		function updateTheme() {
			let theme = Settings.get('theme', 'light');
			document.body.setAttribute('theme', theme);
			themeCheckbox.checked = theme == 'dark';
		}
		
		themeCheckbox.addEventListener('change', () => {
			Settings.set('theme', themeCheckbox.checked ? 'dark' : 'light');
			updateTheme();
		})

		updateTheme();

	}

	function setupGame() {

		const StatExpressions = {
			played: () => WordleStorage.get('totalGames', 0),
			winRate: () => {
				let gamesPlayed = WordleStorage.get('totalGames', 0);
				let gamesWon = WordleStorage.get('totalWins', 0);
				if (gamesPlayed == 0)
					return `0%`;
				return `${Math.floor(100 * gamesWon / gamesPlayed)}%`
			},
			streak: () => WordleStorage.get('currentWinStreak', 0),
			bestStreak: () => WordleStorage.get('bestWinStreak', 0),
		}
	
		let results = document.getElementById('results');
		let share = results.querySelector('#share');
		let root = document.getElementById('game');
		let game = new Wordle(root);

		let clipboardToast = Toastify({
			text: "Copied to Clipboard",
			className: 'toast',
			duration: 3000,
			close: false,
			gravity: 'bottom',
			position: 'center',
			stopOnFocus: true,
		});

		let solvedToast = Toastify({
			text: "Magnificent!",
			className: 'toast large',
			duration: 3000,
			close: false,
			gravity: 'top',
			position: 'center',
			offset: {
				y: 48
			},
			stopOnFocus: true,
		});

		function updateGameOutcome() {
			let outcome = results.querySelector('#game-outcome');
			if (game.isFinished()) {
				let solution = outcome.querySelector('#solution');
				let guesses = outcome.querySelector('#guesses');
				for (let i = 0; i < WORD_LENGTH; i++) {
					let tile = solution.children[i];
					tile.textContent = game.answer.charAt(i);
					tile.setAttribute('state', game.solved ? TileState.Correct : TileState.Wrong);
				}
				let guessCount = game.guesses.length;
				if (game.solved)
					guesses.textContent = `You guessed it in ${guessCount} ${guessCount > 1 ? "turns" : "turn"}!`;
				else
					guesses.textContent = 'You failed to guess the word.';
				outcome.classList.remove('no-display');
			}
			else {
				outcome.classList.add('no-display');
			}
		}

		function updateGameStats() {
			results.querySelectorAll(`.value[stat]`).forEach(element => {
				let stat = element.getAttribute('stat');
				if (stat in StatExpressions)
					element.textContent = StatExpressions[stat]();
			})
			let guessDistribution = WordleStorage.get('guessDistribution', [1, 1, 1, 1, 1, 1]);
			let max = Math.max(...guessDistribution);
			let heatmap = results.querySelector('#game-heatmap .heatmap');
			for (let i = 0; i < 6; i++) {
				let entry = heatmap.children[i];
				let bar = entry.querySelector('.bar');
				let value = guessDistribution[i];
				bar.style.width = `calc(${100 * value / max}% - 24px)`
			}
		}

		function updateTimer() {
			let timer = results.querySelector('#timer');
			let date = new Date();
			let hours = date.getHours();
			let minutes = date.getMinutes();
			let seconds = date.getSeconds();
			let pad = num => num < 10 ? `0${num}` : num.toString();
			timer.textContent = `${pad(23 - hours)}:${pad(59 - minutes)}:${pad(59 - seconds)}` // TODO: 0-Padding
		}

		board.addEventListener('finished', event => {
			if (game.solved)
				solvedToast.showToast();
			updateGameOutcome();
			updateGameStats();
			window.location.hash = '#results';
		});

		board.addEventListener('updated', event => {
			game.save();
		});

		share.addEventListener('click', () => {
			let lines = [];
			if (game.solved)
				lines.push(`Rewordle #${game.getCode()} ${game.guesses.length}/6`);
			else
				lines.push(`Rewordle #${game.getCode()} Failed`);
			lines.push('');
			lines.push(game.toString());
			// lines.push('');
			// lines.push('https://rewordle.app/');
			navigator.clipboard.writeText(lines.join('\n'));
			clipboardToast.showToast();
		})

		function isLetter(str) {
			return str.length === 1 && str.match(/[a-z]/i);
		}

		document.addEventListener('keydown', input => {
			if (input.key == "Enter")
				game.makeGuess(game.currentGuess);
			else if (input.key == "Backspace")
				game.updateCurrentGuess(game.currentGuess.slice(0, -1));
			else if (isLetter(input.key))
				game.updateCurrentGuess(game.currentGuess + input.key);
		});

		// game.reset();
		game.load();

		updateGameStats();
		updateGameOutcome();

		setInterval(updateTimer, 1000);

	}

	function setupNavigation() {

		let gamePane = document.getElementById('game');

		function updateLocation() {
			document.querySelectorAll('.pane').forEach(element => element.classList.add('hidden'));
			let selected = window.location.hash.length > 0 ? document.querySelector(window.location.hash) : null;
			if (selected) {
				selected.classList.remove('hidden');
				gamePane.classList.add('hidden');
			}
			else {
				gamePane.classList.remove('hidden');
			}
		}

		window.addEventListener('hashchange', updateLocation);
		updateLocation();

	}

	setupNavigation();
	setupSettings();
	setupGame();

	setTimeout(() => {
		document.body.classList.remove('preload');
	}, 500);

}

main();



