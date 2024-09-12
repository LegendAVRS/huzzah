<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '../firebase';
	import {
		collection,
		count,
		doc,
		getAggregateFromServer,
		getDoc,
		getDocs,
		increment,
		updateDoc
	} from 'firebase/firestore';
	import type { PageData } from './$types';

	$: counter = 0;
	$: localCounter = 0;
	let oldCounter = 0;
	let bgm: HTMLAudioElement;
	let isPlaying = false;
	let audioContext = null;
	export let data: PageData;

	let currentSounds: {
		url: string;
	}[] = [];

	const fetchSounds = async () => {
		const soundsRef = collection(db, 'sounds');
		const snaps = await getDocs(soundsRef);
		const soundData = snaps.docs.map((doc) => ({
			url: doc.data().url
		}));
		return soundData;
	};

	const fetchCount = async () => {
		const counterRef = collection(db, 'counter');
		const docRef = doc(counterRef, 'countTrack');
		const counterSnapshot = await getDoc(docRef);
		if (counterSnapshot.exists()) {
			return counterSnapshot.data().value;
		}
	};

	onMount(() => {
		// Fetch sounds and counter initially
		bgm = new Audio('bgm.mp3');
		bgm.loop = true;

		fetchCount().then((fetchedCounter) => {
			counter = fetchedCounter;
		});

		// Set up the interval to fetch count every 5 seconds
		const interval = setInterval(async () => {
			const newCounter = await fetchCount();
			if (counter < newCounter) {
				// Increment counter smoothly
				const raiseInterval = setInterval(() => {
					if (counter < newCounter) {
						counter++;
					} else {
						clearInterval(raiseInterval); // Clear when done
					}
				}, 10);
			}
		}, 10000);

		const updateGlobalCounter = async () => {
			if (localCounter == oldCounter) return;
			try {
				const counterRef = collection(db, 'counter');
				const docRef = doc(counterRef, 'countTrack');

				await updateDoc(docRef, {
					value: increment(localCounter - oldCounter)
				});
				oldCounter = localCounter;
			} catch (e) {
				console.error(e);
			}
		};
		const updateInterval = setInterval(updateGlobalCounter, 5000);

		// Return a synchronous cleanup function
		return () => {
			clearInterval(interval);
			clearInterval(updateInterval);
		};
	});

	// const playAudio = async () => {
	// 	const soundsRef = collection(db, 'sounds');
	// 	const docRef = doc(soundsRef, Math.floor(Math.random() * soundNumber).toString());
	// 	const docSnap = await getDoc(docRef);
	// 	console.log(docSnap);
	// 	if (docSnap.exists()) {
	// 		const audio = new Audio(docSnap.data().url);
	// 		audio.play();
	// 	}
	// };

	const playAudio = () => {
		if (!currentSounds.length) {
			currentSounds = JSON.parse(JSON.stringify(data.sounds));
		}
		const randomIndex = Math.floor(Math.random() * currentSounds.length);
		const audio = new Audio(currentSounds[randomIndex].url);
		audio.play();

		currentSounds.splice(randomIndex, 1);
	};

	const updateLocalCounter = async () => {
		counter++;
		localCounter++;
	};
	const handleClick = () => {
		playAudio();
		updateLocalCounter();
	};

	const handlePlayBGM = (event) => {
		isPlaying = event.target.checked;
		if (isPlaying) {
			if (!audioContext) {
 				audioContext = new (window.AudioContext)();
				const gainNode = audioContext.createGain();
				gainNode.gain.value = 0.1; 
				const source = audioContext.createMediaElementSource(bgm);
				source.connect(gainNode);
				gainNode.connect(audioContext.destination);
			}
			bgm.play();
		} else {
			bgm.pause();
		}
	};
</script>

<main class="flex flex-col items-center justify-center h-screen">
	<p class="text-6xl font-semibold">
		{counter.toLocaleString()}
	</p>
	<p class="mb-12 text-2xl">Global Huzzah! Counter</p>
	<img
		class="object-cover w-[9em] aspect-square cursor-pointer grayscale hover:grayscale-0 transition-all min-[2000px]:w-[15rem]"
		alt="sound"
		src="huzzah.jpg"
		on:click={handleClick}
	/>
	<p class="text-lg font-semibold mt-2 mb-8">Huzzah! Counter: {localCounter}</p>
	<p>
		Subscribe to <a
			target="_blank"
			class="font-medium underline-offset-2 underline"
			href="https://www.youtube.com/@holoen_gigimurin">Gonathan G Ch. Cerulean Cup</a
		>
	</p>
	<div class="flex flex-col gap-2 items-center justify-center">
		<p>
			Art by <a
				target="_blank"
				href="https://x.com/SharkBiteTail/status/1832814903364899000"
				class="underline underline-offset-3">@SharBiteTail</a
			>
		</p>
		<p class="text-xs">
			Created by <a
				href="https://x.com/hiroavrs"
				target="_blank"
				class="underline underline-offset-3">Hiro</a
			>
			(Inspired by
			<a href="https://faunaraara.com/" target="_blank" class="underline underline-offset-3"
				>Joel Z</a
			>)
		</p>
	</div>
	<div class="absolute right-5 bottom-4">
		<label class="checkbox-container">
			Play BGM
			<input type="checkbox" on:change={handlePlayBGM} />
			<span class="checkmark"></span>
		</label>
	</div>
</main>

<style>
	.checkbox-container {
		display: inline-block;
		position: relative;
		padding-left: 35px;
		cursor: pointer;
		font-size: 18px;
		user-select: none;
	}

	.checkbox-container input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 25px;
		width: 25px;
		background-color: #ccc;
		border-radius: 5px;
		transition: background-color 0.3s ease;
	}

	.checkbox-container:hover input ~ .checkmark {
		background-color: #b3b3b3;
	}

	.checkbox-container input:checked ~ .checkmark {
		background-color: #4caf50;
	}

	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}

	.checkbox-container input:checked ~ .checkmark:after {
		display: block;
	}

	.checkbox-container .checkmark:after {
		left: 9px;
		top: 5px;
		width: 6px;
		height: 12px;
		border: solid white;
		border-width: 0 3px 3px 0;
		transform: rotate(45deg);
	}

	label {
		font-size: 1.2rem;
		font-weight: bold;
		color: #333;
	}
</style>
