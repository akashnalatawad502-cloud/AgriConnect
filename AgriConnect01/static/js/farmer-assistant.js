document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("farmerAssistant");
  const form = document.getElementById("assistantForm");
  const messages = document.getElementById("assistantMessages");
  const welcome = document.getElementById("assistantWelcome");
  const question = document.getElementById("assistantQuestion");
  const newChat = document.getElementById("assistantNewChat");
  const imageInput = document.getElementById("assistantImageInput");
  const attachButton = document.getElementById("assistantAttach");
  const imagePreview = document.getElementById("assistantImagePreview");
  const imageThumbnail = document.getElementById("assistantImageThumbnail");
  const imageName = document.getElementById("assistantImageName");
  const imageRemove = document.getElementById("assistantImageRemove");
  const imageError = document.getElementById("assistantImageError");
  const micButton = document.getElementById("assistantMic");
  const voiceStatus = document.getElementById("assistantVoiceStatus");
  if (!widget || !form || !messages || !welcome || !question || !newChat ||
      !imageInput || !attachButton || !imagePreview || !imageThumbnail ||
      !imageName || !imageRemove || !imageError || !micButton || !voiceStatus) return;

  const history = [];
  const imageUrls = new Set();
  let selectedImage = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let voiceBaseText = "";
  const copy = {
    en: { you: "You", assistant: "Farmer Assist", thinking: "Thinking…", error: "The assistant could not answer. Please try again.", connection: "Could not reach the assistant. Check your connection and try again.", empty: "Enter a question or add a crop image.", imageType: "Choose a JPEG, PNG, or WebP image.", imageSize: "Crop images must be 3 MB or smaller.", imagePrompt: "Please examine this crop image and suggest possible causes and safe next steps.", imageAttached: "Crop image attached", imageReadError: "The image could not be read. Please choose it again.", voiceStart: "Start voice input", voiceStop: "Stop voice input", voiceListening: "Listening… Speak your question.", voiceUnsupported: "Voice input is not supported in this browser. Try a recent version of Chrome or Edge.", voicePermission: "Microphone access was denied. Allow microphone access in your browser settings and try again.", voiceNoSpeech: "No speech was detected. Try speaking again.", voiceError: "Voice input could not start. Check your microphone and try again." },
    hi: { you: "आप", assistant: "किसान सहायक", thinking: "सोच रहा है…", error: "सहायक जवाब नहीं दे पाया। कृपया फिर से प्रयास करें।", connection: "सहायक से संपर्क नहीं हो पाया। अपना कनेक्शन जाँचकर फिर से प्रयास करें।", empty: "सवाल लिखें या फसल की तस्वीर जोड़ें।", imageType: "JPEG, PNG या WebP तस्वीर चुनें।", imageSize: "फसल की तस्वीर 3 MB या उससे छोटी होनी चाहिए।", imagePrompt: "कृपया इस फसल की तस्वीर देखें और संभावित कारण व सुरक्षित अगले कदम बताएँ।", imageAttached: "फसल की तस्वीर जोड़ी गई", imageReadError: "तस्वीर पढ़ी नहीं जा सकी। कृपया इसे फिर से चुनें।", voiceStart: "आवाज़ से लिखना शुरू करें", voiceStop: "आवाज़ से लिखना रोकें", voiceListening: "सुन रहा है… अपना सवाल बोलें।", voiceUnsupported: "इस ब्राउज़र में आवाज़ से इनपुट उपलब्ध नहीं है। Chrome या Edge का नया संस्करण आज़माएँ।", voicePermission: "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति देकर फिर प्रयास करें।", voiceNoSpeech: "कोई आवाज़ नहीं मिली। फिर से बोलकर देखें।", voiceError: "आवाज़ इनपुट शुरू नहीं हो सका। माइक्रोफ़ोन जाँचकर फिर प्रयास करें।" },
    kn: { you: "ನೀವು", assistant: "ರೈತ ಸಹಾಯಕ", thinking: "ಯೋಚಿಸುತ್ತಿದೆ…", error: "ಸಹಾಯಕ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", connection: "ಸಹಾಯಕವನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", empty: "ಪ್ರಶ್ನೆ ನಮೂದಿಸಿ ಅಥವಾ ಬೆಳೆ ಚಿತ್ರ ಸೇರಿಸಿ.", imageType: "JPEG, PNG ಅಥವಾ WebP ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", imageSize: "ಬೆಳೆ ಚಿತ್ರವು 3 MB ಅಥವಾ ಕಡಿಮೆ ಇರಬೇಕು.", imagePrompt: "ದಯವಿಟ್ಟು ಈ ಬೆಳೆ ಚಿತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ, ಸಂಭವನೀಯ ಕಾರಣಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಮುಂದಿನ ಕ್ರಮಗಳನ್ನು ಸೂಚಿಸಿ.", imageAttached: "ಬೆಳೆ ಚಿತ್ರವನ್ನು ಸೇರಿಸಲಾಗಿದೆ", imageReadError: "ಚಿತ್ರವನ್ನು ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಆಯ್ಕೆಮಾಡಿ.", voiceStart: "ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಪ್ರಾರಂಭಿಸಿ", voiceStop: "ಧ್ವನಿ ಇನ್‌ಪುಟ್ ನಿಲ್ಲಿಸಿ", voiceListening: "ಕೇಳುತ್ತಿದೆ… ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ.", voiceUnsupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. Chrome ಅಥವಾ Edge ನ ಇತ್ತೀಚಿನ ಆವೃತ್ತಿಯನ್ನು ಪ್ರಯತ್ನಿಸಿ.", voicePermission: "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", voiceNoSpeech: "ಯಾವುದೇ ಮಾತು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಮತ್ತೆ ಮಾತನಾಡಿ.", voiceError: "ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಪ್ರಾರಂಭಿಸಲಾಗಲಿಲ್ಲ. ಮೈಕ್ರೊಫೋನ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." }
  };
  const activeLanguage = () => {
    const language = document.documentElement.lang;
    return copy[language] ? language : "en";
  };
  const text = (language, key) => copy[language][key];
  const showVoiceStatus = (message = "") => {
    voiceStatus.textContent = message;
    voiceStatus.hidden = !message;
  };
  const setListening = (listening) => {
    micButton.classList.toggle("is-listening", listening);
    micButton.setAttribute("aria-pressed", String(listening));
    micButton.setAttribute("aria-label", text(activeLanguage(), listening ? "voiceStop" : "voiceStart"));
    micButton.title = text(activeLanguage(), listening ? "voiceStop" : "voiceStart");
  };

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setListening(true);
      showVoiceStatus(text(activeLanguage(), "voiceListening"));
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .trim();
      question.value = [voiceBaseText, transcript].filter(Boolean).join(voiceBaseText ? " " : "");
      question.dispatchEvent(new Event("input"));
    };
    recognition.onerror = (event) => {
      const key = event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "voicePermission"
        : event.error === "no-speech" ? "voiceNoSpeech" : "voiceError";
      showVoiceStatus(text(activeLanguage(), key));
    };
    recognition.onend = () => {
      setListening(false);
      if (voiceStatus.textContent === text(activeLanguage(), "voiceListening")) {
        showVoiceStatus();
      }
      question.focus();
    };
  }

  micButton.setAttribute("aria-pressed", "false");
  micButton.addEventListener("click", () => {
    if (!recognition) {
      showVoiceStatus(text(activeLanguage(), "voiceUnsupported"));
      return;
    }
    if (micButton.classList.contains("is-listening")) {
      recognition.stop();
      return;
    }
    voiceBaseText = question.value.trim();
    recognition.lang = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" }[activeLanguage()];
    showVoiceStatus();
    try {
      recognition.start();
    } catch (_error) {
      showVoiceStatus(text(activeLanguage(), "voiceError"));
    }
  });

  const addMessage = (role, content, language = activeLanguage(), imageUrl = "") => {
    messages.hidden = false;
    const article = document.createElement("article");
    article.className = `assistant-message ${role === "model" ? "assistant-message-bot" : "assistant-message-user"}`;
    const label = document.createElement("strong");
    label.textContent = role === "model" ? text(language, "assistant") : text(language, "you");
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    article.append(label, paragraph);
    if (imageUrl) {
      const image = document.createElement("img");
      image.className = "assistant-inline-image";
      image.src = imageUrl;
      image.alt = text(language, "imageAttached");
      article.append(image);
    }
    messages.append(article);
    messages.scrollTop = messages.scrollHeight;
    return article;
  };

  document.querySelectorAll(".assistant-prompt").forEach((prompt) => {
    prompt.addEventListener("click", () => {
      question.value = prompt.dataset.prompt || "";
      question.focus();
      question.dispatchEvent(new Event("input"));
    });
  });

  question.addEventListener("input", () => {
    question.style.height = "auto";
    question.style.height = `${Math.min(question.scrollHeight, 150)}px`;
  });

  question.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  const clearSelectedImage = (revokeUrl = true) => {
    if (selectedImage && revokeUrl) {
      URL.revokeObjectURL(selectedImage.url);
      imageUrls.delete(selectedImage.url);
    }
    selectedImage = null;
    imageInput.value = "";
    imagePreview.hidden = true;
    imageThumbnail.removeAttribute("src");
    imageName.textContent = "";
  };

  const showImageError = (message = "") => {
    imageError.textContent = message;
    imageError.hidden = !message;
  };

  attachButton.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", () => {
    showImageError();
    const file = imageInput.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      clearSelectedImage();
      showImageError(text(activeLanguage(), "imageType"));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      clearSelectedImage();
      showImageError(text(activeLanguage(), "imageSize"));
      return;
    }
    clearSelectedImage();
    const url = URL.createObjectURL(file);
    imageUrls.add(url);
    selectedImage = { file, url };
    imageThumbnail.src = url;
    imageName.textContent = file.name;
    imagePreview.hidden = false;
  });
  imageRemove.addEventListener("click", () => {
    clearSelectedImage();
    showImageError();
    attachButton.focus();
  });

  newChat.addEventListener("click", () => {
    if (recognition && micButton.classList.contains("is-listening")) recognition.stop();
    showVoiceStatus();
    history.length = 0;
    messages.replaceChildren();
    messages.hidden = true;
    welcome.hidden = false;
    question.value = "";
    question.style.height = "auto";
    clearSelectedImage();
    showImageError();
    imageUrls.forEach((url) => URL.revokeObjectURL(url));
    imageUrls.clear();
    question.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (recognition && micButton.classList.contains("is-listening")) recognition.stop();
    const language = activeLanguage();
    const imageToSend = selectedImage;
    const typedMessage = question.value.trim();
    if (!typedMessage && !imageToSend) {
      showImageError(text(language, "empty"));
      question.focus();
      return;
    }
    const message = typedMessage || text(language, "imagePrompt");
    showImageError();
    addMessage("user", message, language, imageToSend?.url || "");
    question.value = "";
    question.style.height = "auto";
    question.disabled = true;
    attachButton.disabled = true;
    imageInput.disabled = true;
    imageRemove.disabled = true;
    micButton.disabled = true;
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    newChat.disabled = true;
    welcome.hidden = true;
    clearSelectedImage(false);
    const pending = addMessage("model", text(language, "thinking"), language);

    try {
      let image = null;
      if (imageToSend) {
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(imageToSend.file);
          });
          image = {
            mime_type: imageToSend.file.type,
            data: dataUrl.split(",", 2)[1]
          };
        } catch (_error) {
          throw new Error(text(language, "imageReadError"));
        }
      }
      const response = await fetch(widget.dataset.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("meta[name='csrf-token']").content
        },
        body: JSON.stringify({ message, language, history: history.slice(-8), image })
      });
      const payload = await response.json();
      pending.remove();
      if (!response.ok) {
        addMessage("model", payload.error || text(language, "error"), language);
        return;
      }
      addMessage("model", payload.answer, language);
      history.push({ role: "user", text: message }, { role: "model", text: payload.answer });
      if (history.length > 8) history.splice(0, history.length - 8);
    } catch (error) {
      pending.remove();
      addMessage("model", error.message || text(language, "connection"), language);
    } finally {
      question.disabled = false;
      attachButton.disabled = false;
      imageInput.disabled = false;
      imageRemove.disabled = false;
      micButton.disabled = false;
      button.disabled = false;
      newChat.disabled = false;
      question.focus();
    }
  });
});
