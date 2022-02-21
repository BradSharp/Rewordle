// var seconds = 9999;
// // multiply by 1000 because Date() requires miliseconds
// var date = new Date(seconds * 1000);
// var hh = date.getUTCHours();
// var mm = date.getUTCMinutes();
// var ss = date.getSeconds();
// // If you were building a timestamp instead of a duration, you would uncomment the following line to get 12-hour (not 24) time
// // if (hh > 12) {hh = hh % 12;}
// // These lines ensure you have two-digits
// if (hh < 10) {hh = "0"+hh;}
// if (mm < 10) {mm = "0"+mm;}
// if (ss < 10) {ss = "0"+ss;}
// // This formats your string to HH:MM:SS
// var t = hh+":"+mm+":"+ss;
// document.write(t);

function main() {

	function setupGame() {
	
		var results = document.getElementById('results');
		var share = results.querySelector('#share');
		var board = document.getElementById('board');
		var keyboard = document.getElementById('keyboard');
		var game = new Wordle(board, keyboard);

		var clipboardToast = Toastify({
			text: "Copied to Clipboard",
			className: 'toast',
			duration: 3000,
			close: false,
			gravity: 'bottom',
			position: 'center',
			stopOnFocus: true,
		});

		var solvedToast = Toastify({
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
			var outcome = results.querySelector('#game-outcome');
			if (game.finished) {
				var solution = outcome.querySelector('#solution');
				var guesses = outcome.querySelector('#guesses');
				for (var i = 0; i < WORD_LENGTH; i++) {
					var tile = solution.children[i];
					tile.textContent = game.answer.charAt(i);
					tile.setAttribute('state', game.solved ? TileState.Correct : TileState.Wrong);
				}
				var guessCount = game.guesses.length;
				if (game.solved)
					guesses.textContent = `You guessed it in ${guessCount} ${guessCount > 1 ? "turns" : "turn"}!`;
				else
					guesses.textContent = 'You failed to guess the word.';
				outcome.classList.remove('hidden');
			}
			else {
				outcome.classList.add('hidden');
			}
		}

		function updateDistribution() {

		}

		function updateGameStats() {
			var data = window.localStorage.getItem('stats');
			var stats = data ? JSON.parse(data) : null;
			if (!stats)
				return;
			results.querySelectorAll(`.value[stat]`).forEach(field => {
				var stat = field.getAttribute('stat');
				field.textContent = stats.values[stat];
			})
			// results.querySelectorAll(`.bar[index]`).forEach(field => {
			// 	var stat = field.getAttribute('index');
			// 	field.textContent = stats.values[stat];
			// })
		}

		function updateTimer() {
			var timer = results.querySelector('#timer');
			var date = new Date();
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();
			timer.textContent = `${23 - hours}:${59 - minutes}:${59 - seconds}`
		}

		board.addEventListener('finished', event => {
			if (game.solved)
				solvedToast.showToast();
			updateGameOutcome();
			updateGameStats();
			updateDistribution();
			window.location.hash = '#results';
		});

		board.addEventListener('updated', event => {
			game.save();
		});

		share.addEventListener('click', () => {
			var lines = [];
			lines.push(`Rewordle #${game.day} ${game.guesses.length}/6`);
			lines.push('');
			for (var i = 0; i < game.guesses.length; i++) {
				var result = game.checkWord(game.guesses[i]);
				lines.push(result ? result.map(state => {
					switch (state) {
						case TileState.Correct: return '🟩';
						case TileState.Valid: return '🟨';
						default: return '⬜';
					}
				}).join('') : '⬜⬜⬜⬜⬜')
			}
			navigator.clipboard.writeText(lines.join('\n'));
			clipboardToast.showToast();
		})

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
		updateDistribution();

		setInterval(updateTimer, 1000);

	}

	function setupNavigation() {

		function updateLocation() {
			document.querySelectorAll('.pane').forEach(element => element.classList.add('hidden'));
			if (window.location.hash.length > 0) {
				var selected = document.querySelector(window.location.hash);
				if (selected)
					selected.classList.remove('hidden');
			}
		}

		window.addEventListener('hashchange', updateLocation);
		updateLocation();

	}

	setupNavigation();
	setupGame();

	setTimeout(() => {
		document.body.classList.remove('preload');
	}, 500);

}

main();



