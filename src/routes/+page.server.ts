import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const fetchSounds = async () => {
	const soundsRef = collection(db, 'sounds');
	const snaps = await getDocs(soundsRef);
	const soundData = snaps.docs.map((doc) => ({
		url: doc.data().url
	}));
	return soundData;
};

export async function load() {
	const data = await fetchSounds();
	return { sounds: data };
}
