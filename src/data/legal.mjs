import { SITE } from '../site.mjs';

export function legalPages() {
  const L = SITE.legal;
  const mail = L.email.startsWith('[') ? L.email : `<a href="mailto:${L.email}">${L.email}</a>`;
  return [
    { path: '/mentions-legales/', title: 'Mentions légales', h1: 'Mentions légales', desc: `Mentions légales de ${SITE.name} : éditeur, hébergeur, propriété intellectuelle et responsabilité.`,
      blocks: [
        { h: 'Éditeur du site', p: [`${SITE.name} est édité par : ${L.editeur}.`, `Statut : ${L.statut}.`, `Adresse : ${L.adresse}.`, `Directeur de la publication : ${L.directeur}.`, `Contact : ${mail}.`] },
        { h: 'Hébergement', p: [`Le site est hébergé par ${L.hebergeur}.`] },
        { h: 'Propriété intellectuelle', p: ['L’ensemble des textes, tableaux, outils de calcul et éléments graphiques du site est protégé par le droit d’auteur. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable de l’éditeur est interdite, sauf courte citation accompagnée d’un lien vers la page d’origine.'] },
        { h: 'Responsabilité', p: ['Les informations publiées sont fournies à titre général et informatif. Elles ne constituent ni un avis vétérinaire, ni un diagnostic, ni une prescription, et ne remplacent pas la consultation d’un vétérinaire. Les calculateurs fournissent des estimations indicatives.', 'L’éditeur s’efforce de publier des informations exactes et à jour, mais ne peut garantir l’absence d’erreur ou d’omission, et décline toute responsabilité quant à l’usage qui en est fait.'] },
        { h: 'Liens externes', p: ['Le site peut contenir des liens vers des sites tiers. L’éditeur n’exerce aucun contrôle sur leur contenu et n’en assume pas la responsabilité.'] },
        { h: 'Données personnelles', p: ['Voir la <a href="/politique-confidentialite/">politique de confidentialité</a> et la <a href="/politique-cookies/">politique de cookies</a>.'] },
      ] },
    { path: '/politique-confidentialite/', title: 'Politique de confidentialité', h1: 'Politique de confidentialité', desc: `Politique de confidentialité de ${SITE.name} : données traitées, finalités, droits RGPD.`,
      blocks: [
        { h: 'Résumé', p: ['Le site n’a pas de comptes utilisateurs, ne demande aucune donnée pour consulter les pages ou utiliser les calculateurs, et ne dépose à ce jour aucun cookie de suivi ni de publicité. Les valeurs saisies dans les calculateurs sont traitées dans votre navigateur et ne sont pas envoyées à nos serveurs.'] },
        { h: 'Responsable du traitement', p: [`${L.editeur} — contact : ${mail}.`] },
        { h: 'Données traitées', ul: ['<strong>Journaux techniques de l’hébergeur</strong> (adresse IP, date, pages demandées, type de navigateur) : conservés par Cloudflare pour la sécurité et le bon fonctionnement du service, sur la base de l’intérêt légitime.', '<strong>Suivi du poids</strong> : si vous utilisez cet outil, vos pesées sont enregistrées uniquement dans le stockage local de votre navigateur. Elles ne sont jamais transmises au site et peuvent être effacées à tout moment depuis l’outil ou en vidant les données du navigateur.', '<strong>Courriels</strong> : si vous nous écrivez, votre adresse et votre message sont utilisés uniquement pour vous répondre.'] },
        { h: 'Publicité', p: ['Le site est financé par la publicité (Google AdSense). Conformément à la réglementation européenne, les annonces personnalisées et les cookies publicitaires ne pourront être utilisés qu’avec votre consentement, recueilli par un système de gestion du consentement compatible avec les exigences de Google. <strong>Ce système n’est pas encore en place : tant qu’il ne l’est pas, aucune publicité n’est chargée et aucun cookie publicitaire n’est déposé.</strong> Cette page sera mise à jour avant toute activation des annonces.'] },
        { h: 'Vos droits', p: ['Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité sur vos données personnelles. Pour les exercer, contactez-nous à l’adresse indiquée ci-dessus. Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).'] },
        { h: 'Mises à jour', p: [`Dernière mise à jour : ${SITE.buildDate}.`] },
      ] },
    { path: '/politique-cookies/', title: 'Politique de cookies', h1: 'Politique de cookies', desc: `Politique de cookies de ${SITE.name} : cookies et stockage local utilisés, et règles pour la publicité.`,
      blocks: [
        { h: 'Ce que le site dépose aujourd’hui', p: ['Aucun cookie de mesure d’audience, de personnalisation ou de publicité n’est déposé par le site à ce jour.', 'Un seul usage du stockage local du navigateur (localStorage) existe : l’outil « Suivi du poids » y enregistre les pesées que vous saisissez, afin de les retrouver à votre prochaine visite. Cette donnée reste sur votre appareil.'] },
        { h: 'Publicité (à venir)', p: ['Le modèle économique du site repose sur la publicité Google AdSense. Ces annonces utilisent des cookies et des identifiants. Elles ne seront chargées qu’après recueil de votre consentement, via un système de gestion du consentement conforme aux exigences européennes. Ce système sera décrit ici dès sa mise en service, avec la possibilité de modifier ou de retirer votre choix à tout moment.'] },
        { h: 'Gérer les cookies', p: ['Vous pouvez à tout moment supprimer le contenu du stockage local et les cookies depuis les paramètres de votre navigateur.'] },
      ] },
    { path: '/conditions-utilisation/', title: 'Conditions d’utilisation', h1: 'Conditions d’utilisation', desc: `Conditions d’utilisation de ${SITE.name} : usage du site, outils indicatifs, limites de responsabilité.`,
      blocks: [
        { h: 'Objet', p: [`${SITE.name} propose des guides, des fiches de races et des outils de calcul gratuits sur les animaux de compagnie. L’accès au site vaut acceptation des présentes conditions.`] },
        { h: 'Nature des informations', p: ['Les contenus sont informatifs. Ils ne remplacent en aucun cas l’examen, le diagnostic ou le conseil d’un vétérinaire. En cas de doute sur la santé de votre animal, ou face à une urgence (intoxication, difficulté respiratoire, traumatisme, convulsions…), contactez immédiatement un vétérinaire ou un service d’urgence vétérinaire.'] },
        { h: 'Outils de calcul', p: ['Les calculateurs produisent des estimations fondées sur des moyennes. Les résultats peuvent différer sensiblement de la situation réelle de votre animal. Ne modifiez jamais le régime, le traitement ou le protocole de soin de votre animal sans avis vétérinaire.'] },
        { h: 'Utilisation du site', p: ['Vous vous engagez à ne pas perturber le fonctionnement du site, à ne pas extraire massivement son contenu et à ne pas le réutiliser à des fins commerciales sans autorisation.'] },
        { h: 'Publicité', p: ['Le site contient ou contiendra des espaces publicitaires, signalés comme tels. Leur présence n’implique aucune recommandation de l’éditeur pour les produits ou services annoncés.'] },
        { h: 'Droit applicable', p: ['Les présentes conditions sont soumises au droit français.'] },
      ] },
    { path: '/contact/', title: 'Contact', h1: 'Nous contacter', desc: `Contacter la rédaction de ${SITE.name} : une question, une correction à signaler, une suggestion.`,
      blocks: [
        { h: 'Écrire à la rédaction', p: [`Pour une question, une correction à signaler ou une suggestion de sujet : ${mail}.`, 'Nous lisons chaque message, mais nous ne pouvons pas répondre aux questions de santé concernant un animal en particulier : seul un vétérinaire qui examine votre animal peut le faire.'] },
        { h: 'Signaler une erreur', p: ['Si vous repérez une information erronée ou périmée, indiquez-nous l’adresse de la page et ce qui doit être corrigé. Les corrections sont prioritaires.'] },
        { callout: { type: 'danger', title: 'Urgence', text: 'Votre animal est en danger (intoxication, accident, détresse respiratoire, convulsions) ? Appelez sans attendre votre vétérinaire ou le service d’urgence vétérinaire le plus proche. N’utilisez pas ce formulaire de contact.' } },
      ] },
    { path: '/a-propos/', title: 'À propos', h1: `À propos de ${SITE.name}`, desc: `${SITE.name} : un portail français pour mieux comprendre, nourrir et prendre soin de son animal. Notre démarche éditoriale.`,
      blocks: [
        { h: 'Notre objectif', p: [`${SITE.name} a pour ambition de devenir une base de connaissances pratique sur les animaux de compagnie : fiches de races, calculateurs, guides et calendriers, pour les propriétaires et futurs propriétaires. Nous commençons par les chiens et les chats, puis élargirons progressivement aux petits animaux, aux oiseaux, à l’aquarium et aux reptiles.`] },
        { h: 'Notre démarche éditoriale', ul: ['<strong>Utile avant tout</strong> : chaque page répond à une question concrète. Nous ne publions pas de pages en série qui ne changent que le nom de la race.', '<strong>Prudence sur la santé</strong> : nous présentons des causes possibles et des repères, jamais un diagnostic, et nous indiquons quand consulter.', '<strong>Des outils qui font vraiment quelque chose</strong> : chaque calculateur explique sa méthode et ses limites.', '<strong>Correction</strong> : toute erreur signalée est vérifiée et corrigée.'] },
        { h: 'Financement', p: ['Le site est gratuit. Il est financé par la publicité display (Google AdSense), sans affiliation ni lien commercial rémunéré. Les annonces sont clairement signalées et ne doivent jamais gêner la lecture ni l’utilisation des outils.'] },
        { callout: { type: 'info', title: 'Important', text: 'Les contenus de ce site sont informatifs et ne remplacent jamais la consultation d’un vétérinaire.' } },
      ] },
  ];
}
