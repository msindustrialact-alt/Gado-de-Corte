from PIL import Image, ImageFilter, ImageDraw

src = Image.open("public/images/login-bg-original.jpg").convert("RGB")
width, height = src.size

k = 0.8
card_left = int(475 - 287 * k)
card_top = int(533 - 257 * k)
card_width = int(574 * k)
card_height = int(514 * k)
card_bottom = card_top + card_height
card_right = card_left + card_width

# Gramado nítido da base da imagem, na mesma largura do card.
grass = src.crop((0, 868, width, height)).resize((width, 150), Image.Resampling.LANCZOS)

out = src.copy()

heal_top = card_bottom - 2
heal_bottom = min(height, card_bottom + 150)
heal_left = max(0, card_left - 18)
heal_right = min(width, card_right + 36)

overlay = Image.new("RGB", (width, height))
overlay.paste(src)
overlay.paste(grass, (0, heal_top))

mask = Image.new("L", (width, height), 0)
draw = ImageDraw.Draw(mask)
draw.rectangle((heal_left, heal_top, heal_right, heal_bottom), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(radius=22))

out = Image.composite(overlay, src, mask)
out.save("public/images/login-bg.jpg", quality=93)
print("card", card_left, card_top, card_right, card_bottom)
print("heal", heal_left, heal_top, heal_right, heal_bottom)
