# -*- coding: utf-8 -*-

## Convert string Base64 Images

def convertBase64String(base64Img,uploadfolder):
    if base64Img.startswith("data:image/png;base64,"):
        import base64
        import random
        base64Img = base64Img[22:]
        image = base64.b64decode(base64Img)
        filename = "projects_thumbnail_%s%s.png" %(random.random(), random.random())

        with open(uploadfolder+filename, 'wb') as imgFile:
            imgFile.write(image)

        return filename

    else:
        return False