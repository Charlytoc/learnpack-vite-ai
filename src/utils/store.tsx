// The store is responsible for managing the state of the application
// This store was created with Zustand

import { create } from 'zustand';
import { convertMarkdownToHTML, changeSidebarVisibility, getRigobotFeedback } from './lib';
import Socket from './socket';
const HOST = "http://localhost:3000";
// const RIGOBOT_HOST = "https://rigobot.herokuapp.com";


Socket.start('http://localhost:3000', disconnected);
    

    
function disconnected() {
  const modal:HTMLElement|null = document.querySelector("#socket-disconnected");

  if (modal) {
    modal.style.display = "block";
  }
}

interface IBuildProps {
  text: string;
  className: string;
}


interface ILanguageMap {
    [key: string]: string;
}


interface IStore {
  exercises: any[];
  currentContent: string;
  currentExercisePosition: number;
  language: string;
  status: string;
  lessonTitle: string;
  numberOfExercises: number;
  feedback: string;
  showFeedback: boolean;
  buildbuttonText: IBuildProps;
  feedbackbuttonProps: IBuildProps;
  compilerSocket: any;
  token: string;
  solvedExercises: number;
  languageMap: ILanguageMap;

  increaseSolvedExercises: () => void;
  setLanguage: (language: string) => void;
  checkLoggedStatus: () => void;
  storeFeedback: (feedback:string) => void;
  setToken: (newToken: string) => void;
  setBuildButtonText: (t:string, c:string) => void;
  setFeedbackButtonProps: (t:string, c:string) => void;
  toggleFeedback: ()=>void;
  fetchExercises: () => void;
  setStatus: (newStatus:string) => void;
  getLessonTitle: () => void;
  setPosition: (position: number) => void;
  fetchReadme: () => void;
  toggleSidebar: () => void;
  toggleLanguage: () => void;
  getAIFeedback: () => void;
}

const useStore = create<IStore>((set, get) => ({
  language: 'us',
  languageMap: {
    "us": "ENG",
    "es": "SPA"
  },
  exercises: [],
  currentContent: "",
  currentExercisePosition: 0,
  lessonTitle: "",
  numberOfExercises: 0,
  solvedExercises: 0,
  status: "",
  feedback: "",
  showFeedback: false,
  token: "",
  buildbuttonText: {
    text: "Run",
    className: ""
  },
  feedbackbuttonProps: {
    text: "Feedback",
    className: ""
  },
  compilerSocket: Socket.createScope('compiler'),
  // functions
  increaseSolvedExercises: () => {
    const {solvedExercises} = get();
    set({solvedExercises:solvedExercises+1 });

  },
  setBuildButtonText: (t, c="") => {
    set({buildbuttonText: {text: t, className: c}})
  },
  setFeedbackButtonProps: (t, c="") => {
    set({feedbackbuttonProps: {text: t, className: c}})
  },
  toggleFeedback: () => {
    const {showFeedback} = get();
    set({showFeedback: !showFeedback})
  },
  setStatus: (newStatus) => {
    set({status: newStatus});
    setTimeout(()=>{
      set({status: ""});
    },5000)
  },
  setToken: (newToken) => {
    set({token: newToken});
  },
  checkLoggedStatus:async () => {
    try {
      const res = await fetch(`${HOST}/check/rigo/status`)
      const json = await res.json();
      set({token: json.rigoToken})

    }
    catch (err) {
      set({token:""})
    }
  },
  fetchExercises: async () => {
    const { fetchReadme, getLessonTitle } = get();
    const res = await fetch(`${HOST}/exercise`)
    const files = await res.json();
    set({ exercises: files });
    set({numberOfExercises: files.length})
    fetchReadme();
    getLessonTitle();

  },
  storeFeedback: (feedback) => {
    const {toggleFeedback} = get();
    const htmlFeedback = convertMarkdownToHTML(feedback);
    set({feedback: htmlFeedback})
    toggleFeedback();

  },
  getAIFeedback: async () => {
    const {currentExercisePosition, exercises, currentContent, toggleFeedback, token} = get();

    const slug = exercises[currentExercisePosition].slug;
    let entryPoint = exercises[currentExercisePosition].entry.split("/")[1]

    const response = await fetch(`${HOST}/exercise/${slug}/file/${entryPoint}`);
    let currentCode;

    // Check if the content type is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      currentCode =  await response.json();
    } else {
      // Handle non-JSON responses, like reading as text
      currentCode = await response.text();
    }
    // console.log("currentContent", currentContent);
    // console.log("currentCode", currentCode);
    
    const feedback = await getRigobotFeedback(currentContent, currentCode, token)
    const htmlFeedback = convertMarkdownToHTML(feedback);
    set({feedback: htmlFeedback})
    toggleFeedback();
  },

  getLessonTitle: async () => {
    const res = await fetch(`${HOST}/config`);
    const {config} = await res.json();
    set({ lessonTitle: config.title });
  },

  setPosition: (newPosition) => {
    let params = window.location.hash.substring(1);
    let paramsArray = params.split('&');
    let language = "";
    if (paramsArray.length >1 ) {
      // get the index of the item that includes "language"
      const langIndex = paramsArray.findIndex(item => item.includes("language"));
      // retrieve the item and save it in a variable
      language = paramsArray[langIndex]
    }
    let hash = `currentExercise=${newPosition}`
    if (language) {
      hash += `&${language}`
    }
    window.location.hash = hash;
    set({ currentExercisePosition: newPosition });
},

  fetchReadme: async () => {
    const { language, exercises, currentExercisePosition } = get();
    const slug = exercises[currentExercisePosition].slug;
    const response = await fetch(`${HOST}/exercise/${slug}/readme?lang=${language}`);
    const exercise = await response.json();
    set({ currentContent: convertMarkdownToHTML(exercise.body) })
  },

  toggleSidebar: () => {
    changeSidebarVisibility()
  },

  setLanguage: (language) => {
    const { fetchReadme } = get();
    set({ language: language});
    fetchReadme();
  },

  toggleLanguage: () => {
    const { language, fetchReadme } = get();
    const newLang = language === 'us' ? 'es' : 'us';
    set({ language: newLang });


    let params = window.location.hash.substring(1);
    let paramsArray = params.split('&');
    let position = "";
    console.log(paramsArray);
    
    if (paramsArray) {
      // get the index of the item that includes "language"
      const posIndex = paramsArray.findIndex(item => item.includes("currentExercise"));
      // retrieve the item and save it in a variable
      position = paramsArray[posIndex]
    }
    let hash = `language=${newLang}`
    if (position) {
      hash += `&${position}`
    }
    window.location.hash = hash;
    
    fetchReadme();
  },

})
);

export default useStore;