package com.leitner.flashcards;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private TextToSpeech tts;
    private boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        tts = new TextToSpeech(this, status -> {
            ttsReady = (status == TextToSpeech.SUCCESS);
        });
        getBridge().getWebView().addJavascriptInterface(new TTSBridge(), "AndroidTTS");
    }

    @Override
    public void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }

    class TTSBridge {
        @JavascriptInterface
        public void speak(String text, String lang) {
            if (!ttsReady || tts == null) return;
            try {
                Locale locale = Locale.forLanguageTag(lang != null ? lang : "nl-NL");
                int result = tts.setLanguage(locale);
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(Locale.ENGLISH);
                }
                tts.setSpeechRate(0.9f);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "leitner");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) tts.stop();
        }
    }
}
