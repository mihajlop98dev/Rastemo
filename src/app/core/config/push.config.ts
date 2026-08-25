/**
 * Javni VAPID ključ.
 *
 * Njime se pregledač pretplaćuje na push, i po prirodi je javan — završava u
 * bundle-u i vidi ga svako. Tajni parnjak stoji isključivo u Supabase secrets
 * pod imenom VAPID_PRIVATE_KEY i nikad ne ulazi u repozitorijum.
 *
 * Ako se ovaj ključ ikad promeni, sve postojeće pretplate prestaju da važe i
 * korisnice moraju ponovo da dozvole notifikacije.
 */
export const PUSH_JAVNI_KLJUC =
  'BBU4rFLzOZqqVaEVTxDsTjqGjODi01PXNhn6qAV-y29i6E_RSBrqjDRfFul6e6Ygw-UxwlB48AIvg4MEOsGShME';

/** Kome push servis šalje žalbu ako nešto ne valja sa slanjem. */
export const PUSH_KONTAKT = 'mailto:kontakt@dnevniktrudnoce.com';
