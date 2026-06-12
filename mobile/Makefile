# Kelime Ezber — mobil derleme/dağıtım kısayolları.
# Komutlar mobile/ dizininden çalıştırılır.

.PHONY: upload check

## upload: production iOS derlemesi yapıp en son derlemeyi TestFlight'a gönderir
upload:
	eas build -p ios --profile production
	eas submit -p ios --latest

## check: tip kontrolü + iOS bundle doğrulaması (yayından önce)
check:
	npx tsc --noEmit
	npx expo export -p ios
