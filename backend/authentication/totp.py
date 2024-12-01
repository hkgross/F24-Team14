import pyotp
import time
import qrcode
import PIL

def test(name, issuerName):
    secretKey=pyotp.random_base32()
    url=pyotp.totp.TOTP(secretKey).provisioning_uri(name=name, issuer_name=issuerName)
    print(secretKey)
    print(url)
    img = qrcode.make(url)
    type(img)  # qrcode.image.pil.PilImage
    img.show()
    codeToVerify=input("Enter new code to verify: ")
    verifier=pyotp.TOTP(secretKey)
    print(verifier.verify(codeToVerify))
    return secretKey

def validate(secretKey, code):
    verifier=pyotp.TOTP(secretKey)
    return verifier.verify(code)

def generateSecretKey():
    return pyotp.random_base32()

def generateQRCode(secretKey, name, issuerName):
    url=pyotp.totp.TOTP(secretKey).provisioning_uri(name=name, issuer_name=issuerName)
    img = qrcode.make(url)
    return img


#test('Test', 'Driver Program')