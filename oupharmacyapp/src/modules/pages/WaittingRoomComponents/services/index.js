import { doc, onSnapshot } from "firebase/firestore";
import APIs, { endpoints } from "../../../../config/APIs"
import { db } from "../../../../config/firebase";
import moment from "moment";
import { APP_ENV } from "../../../../lib/constants";

export const fetchListExaminationToday = async () => {
    const res = await APIs.get(endpoints['get-list-exam-today'])
    return res;
}


export const generateQueryGetExamsListPerDay = (date) => {
    const todayStr = moment(date).format('YYYY-MM-DD');
    const waitingRoomRef = doc(db, `${APP_ENV}_waiting-room`, todayStr);

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(waitingRoomRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const examsArray = docSnapshot.data().exams;
          resolve(examsArray);
        } else {
          resolve([]);
        }
      }, (error) => {
        reject([]);
      });
  
      return () => unsubscribe();
    });
  }