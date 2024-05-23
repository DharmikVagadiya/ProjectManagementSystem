
import { firestore, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { getDocs, collection, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, FieldValue, onSnapshot } from '@firebase/firestore';
import { v4 } from 'uuid';


export const DataFetch = async (Collection, Data, fun) => {
    try {
        let qry = collection(firestore, Collection);

        Object.keys(Data).forEach(field => {
            if (Data[field] !== null && Data[field] !== undefined) {
                qry = query(qry, where(field, '==', Data[field]));
            }
        });
        onSnapshot(qry, (doc) => {
            const data = [];
            doc.forEach(d => { data.push({ id: d.id, ...d.data() }); });
            fun(data);
        });
    } catch (error) {
        return [];
    }
}

export const SelectData = async (Collection, Data, Order = []) => {
    try {
        let qry = collection(firestore, Collection);

        Object.keys(Data).forEach(field => {
            if (Data[field] !== null && Data[field] !== undefined) {
                qry = query(qry, where(field, '==', Data[field]));
            }
        });

        // Add orderBy clauses based on the provided Order array
        // Order.forEach(orderField => {
        // qry = query(qry, orderBy('SerialNo'));
        // });

        // console.log(qry);
        const data = [];
        (await getDocs(qry)).forEach(doc => { data.push({ id: doc.id, ...doc.data() }); });

        return data;
    }
    catch {
        return [];
    }
}

export const SelectDataById = async (Collection, Id) => {
    try {
        let qry = doc(firestore, Collection, Id);

        const data = await getDoc(qry);

        return data.data();
    }
    catch {
        return [];
    }
}

export const InsertData = async (Collection, Data) => {
    try {
        const Id = await addDoc(collection(firestore, Collection), Data);
        return Id.id;
    } catch {

    }
}

export const UpdateData = async (Collection, Id, Data) => {
    try {
        Data = filterData(Data);
        await updateDoc(doc(firestore, Collection, Id), Data);
    } catch {

    }
}

export const DeleteData = async (Collection, Id) => {
    try {
        await deleteDoc(doc(firestore, Collection, Id));
    } catch {

    }
}

const filterData = (Data) => {
    const filteredData = Object.fromEntries(
        Object.entries(Data).filter(([key, value]) => value !== null)
    );

    return filteredData;
}

export const sortByField = (arr, fieldName) => {
    try {
        return arr.sort((a, b) => {
            if (a[fieldName] < b[fieldName]) return -1;
            if (a[fieldName] > b[fieldName]) return 1;
            return 0;
        });
    }
    catch {
        return arr;
    }
};

export const UploadFile = async (File, Path) => {
    try {
        let URL = `${Path}/${v4()}`;
        if (File) {
            if (File !== null && File !== undefined && File !== '') {
                const imgRef = ref(storage, URL);
                await uploadBytes(imgRef, File).then(() => {
                    console.log("File uploaded Successfully.");
                }).catch((error) => {
                    console.log('error occurs : ' + error);
                })
            }
        }

        return URL;
    }
    catch {
        return '';
    }
}

export const GetDownloadURL = async (URL) => {
    try {
        let url = '';
        if (URL !== null && URL !== '') {
            await getDownloadURL(ref(storage, URL)).then((uri) => {
                // console.log('URL Found.');
                url = uri;
            }).catch((error) => {
                console.log('error occurs');
            })
        }

        return url;
    }
    catch {
        return '';
    }
}

export { FieldValue }