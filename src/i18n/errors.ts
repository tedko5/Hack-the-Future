import { DEFAULT_LANGUAGE, type Language } from './language.ts'

/** The errors people can see, by their English text. An unknown one stays in English. */
const DUTCH: Record<string, string> = {
  'Something went wrong, please try again': 'Er ging iets mis, probeer het opnieuw',
  'Only commanders can do this': 'Enkel commanders kunnen dit doen',
  'Invalid input': 'Ongeldige invoer',
  'Invalid glitch': 'Ongeldige glitch',
  'Invalid status': 'Ongeldige status',
  'Invalid guardian': 'Ongeldige guardian',
  'Invalid role': 'Ongeldige rol',
  'Invalid conversation': 'Ongeldig gesprek',
  'Invalid message': 'Ongeldig bericht',
  'Invalid search': 'Ongeldige zoekopdracht',
  'Invalid reaction': 'Ongeldige reactie',
  'Invalid notification': 'Ongeldige melding',
  'Invalid image': 'Ongeldige afbeelding',
  'Describe the echo in 1 to 1000 characters': 'Beschrijf de echo in 1 tot 1000 tekens',
  'A new glitch always starts as leaked': 'Een nieuwe glitch begint altijd als gelekt',
  'Use 3 to 24 letters, digits, spaces, - or _':
    'Gebruik 3 tot 24 letters, cijfers, spaties, - of _',
  'That codename is taken': 'Die codenaam is al in gebruik',
  'You cannot change your own role': 'Je kan je eigen rol niet wijzigen',
  'Choose a defender': 'Kies een defender',
  'Only defenders can take a glitch': 'Enkel defenders kunnen een glitch op zich nemen',
  'That glitch does not exist': 'Die glitch bestaat niet',
  'That glitch is already assigned or does not exist':
    'Die glitch is al toegewezen of bestaat niet',
  'That glitch is not assigned to you': 'Die glitch is niet aan jou toegewezen',
  'Only the assigned defender or a commander can change the status':
    'Enkel de toegewezen defender of een commander kan de status wijzigen',
  'This glitch cannot be hacked anymore': 'Deze glitch kan niet meer gehackt worden',
  'That conversation does not exist': 'Dat gesprek bestaat niet',
  'That message does not exist': 'Dat bericht bestaat niet',
  'That message does not exist or is not yours': 'Dat bericht bestaat niet of is niet van jou',
  'Invalid echo': 'Ongeldige echo',
  'That echo does not exist': 'Die echo bestaat niet',
  'Only its author or a commander can edit an echo':
    'Enkel de auteur of een commander kan een echo bewerken',
  'This is the only echo, remove the glitch instead':
    'Dit is de enige echo, verwijder in plaats daarvan de glitch',
  'The message you reply to does not exist': 'Het bericht waarop je antwoordt, bestaat niet',
  'Write 1 to 1000 characters, or add an image':
    'Schrijf 1 tot 1000 tekens, of voeg een afbeelding toe',
  'Search for up to 100 characters': 'Zoek met hoogstens 100 tekens',
  'Use a JPEG, PNG, WebP or GIF image': 'Gebruik een JPEG-, PNG-, WebP- of GIF-afbeelding',
  'Images can be up to 3 MB': 'Afbeeldingen mogen hoogstens 3 MB zijn',
  'That file is not an image this browser can read':
    'Dat bestand is geen afbeelding die deze browser kan lezen',
  'This browser cannot prepare the image': 'Deze browser kan de afbeelding niet voorbereiden',
}

export function translateError(message: string, language: Language) {
  return language === DEFAULT_LANGUAGE ? message : (DUTCH[message] ?? message)
}
