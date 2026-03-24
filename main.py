import webview
import os
import sys

def get_base_path():
    if getattr(sys, 'frozen', False):
        # Running as compiled pyinstaller executable
        return sys._MEIPASS
    else:
        # Running as a script
        return os.path.dirname(os.path.abspath(__file__))

if __name__ == '__main__':
    base_path = get_base_path()
    html_path = os.path.join(base_path, 'index.html')
    
    # Windows paths need forward slashes for file URI
    file_uri = f'file:///{html_path.replace(chr(92), "/")}'
    
    webview.create_window(
        title='Gelişmiş Hesap Makinesi',
        url=file_uri,
        width=950,
        height=700,
        min_size=(450, 650),
        background_color='#0d1117'
    )
    webview.start()
