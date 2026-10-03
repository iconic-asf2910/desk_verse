import os 
import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv
from streamlit_mic_recorder import mic_recorder

load_dotenv()

client = OpenAI()

st.set_page_config(page_title='AI Meeting Notes generator', page_icon= '🎙️', layout='wide')

st.title('🎙️ AI Meeting Notes Generator')
st.subheader('Record live audio, transcribe instantly and generate actionable meeting summaries using AI')

if 'transcript' not in st.session_state:
    st.session_state.transcript = ''

if 'meeting_notes' not in st.session_state:
    st.session_state.meeting_notes = ''

if 'audio_bytes' not in st.session_state:
    st.session_state.audio_bytes = None

layout_col1, layout_col2 = st.columns([1, 2])

with layout_col1:
    st.header('1, Capture Audio')
    st.write('Click below to start recording.')

    audio_data = mic_recorder(
        start_prompt= 'Start Recording',
        stop_prompt= 'Stop and Process',
        key= 'recorder'
    )

    if audio_data:
        st.session_state.audio_bytes = audio_data['bytes']

        st.success['Audio Captured successfully!']

        st.audio(st.session_state.audio_bytes, format= 'audio/wav')

    if st.session_state.audio_bytes and st.button('✨ Generate AI Transcript & Notes'):
        with st.spinner('Processing audio track with whisper AI...'):

            temp_filename= 'temp_meeting_audio.wav'

            with open(temp_filename, 'wb')as f:
                f.write(st.session_state.audio_bytes)

            try:

                with open(temp_filename, 'rb')as audio_file:
                    transcript_response = client.audio.transcriptions.create(
                        model= 'whisper-1'
                        file= audio_file
                    )

                    st.session_state.transcript = transcript_response.text

                with st.spinner('Summarsing notes and assigning tasks...'):
                    gpt_response = client.chat.completions.create(
                        model= 'gpt-4o',
                        messages=[
                            {
                                'role': 'system'
                                content : (
                                    "You are an elite executive assistant. Take the following unedited audio transcript "
                                    "and turn it into structured , professional meeting minutes. Include: \n"
                                    "1. Executive Summary\n"
                                    "2. Key Takeaways and Decisions made\n"
                                    "3. Action Items (with explicit owners assigned if mentioned, otherwise leave a placeholder)."
                                )

                            },
                            {'role': 'user', 'content': st.session_state.transcript}
                        ]
                    )
                    st.session_state.meeting_notes = gpt_response.choices[0].message.content

            except Exception as e:
                st.error(f'An API error occured: {e}')

            finally:
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)

with layout_col2:

    st.header('2. Live Transcripts and AI Insights')

    tab1, tab2 =     
            
        
