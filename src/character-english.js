import { characters } from "./data.js";
import { FINAL_BOSS, createFinalBossAbilities } from "./final-boss.js";

// Hand-edited character copy keeps lore and play advice natural in English.
const characterCopy = {
  "o-acougueiro": {
    lore: "Bloodshed's executioner: his cleaver recognizes the Essence of a wounded victim. Every wound sharpens his instinct and makes the next lunge more ruthless.",
    combo: "Apply Bleed, then choose whether to reopen the same wound or consume it with the Sentence.",
    passive: "Blood Instinct"
  },
  "a-viuva-escarlate": {
    lore: "She keeps the memory of every blow she has taken beneath a scarlet veil. She draws an enemy's blade close, then turns the answer into a claim on their vitality. Her grief endures through the violence she offers Bloodshed.",
    combo: "Lure an attack into the veil, then claim Health from whoever struck you.",
    passive: "Hungry Mourning"
  },
  "o-colecionador-de-cabecas": {
    lore: "He keeps each victim's spiritual signature as a trophy. He hunts those who have already left an opening, gathering traces for a careful, prepared execution. His collection grows with the carnage that feeds Bloodshed.",
    combo: "Collect trophies, then choose when to spend your two powerful executions.",
    passive: "First Trophy"
  },
  "gemeos-do-cutelo": {
    lore: "Two souls of Bloodshed share the rhythm of a single hunt. One cut clears a path for the other's blade until their strikes meet on the same victim. Their alternating attacks turn every approach into a double threat.",
    combo: "Use one cut to set up the other, then choose between a focused follow-up and a crossing strike.",
    passive: "The Twins' Rhythm"
  },
  "o-carrasco-sem-rosto": {
    lore: "His sentence turns any aid offered to a victim into another reason to punish them. He hides his identity while choosing when to break resistance and when to finish the execution. Bloodshed knows his work by the blade that falls.",
    combo: "Mark a sentence that punishes support; interrupt the victim or save the execution for when they are wounded.",
    passive: "No Appeal"
  },
  "a-mae-rubra": {
    lore: "She extends a cord of Essence stolen from her victims to those in her care. She gives up her own vitality to keep the circle intact, then recovers what she lost by draining another soul. Her protection keeps Bloodshed's predators in the fight.",
    combo: "Trade your Health for an ally's guard and future recovery; sustain yourself by draining an enemy.",
    passive: "Sheltering Blood"
  },
  "o-soberano-quebrado": {
    lore: "He carries a fractured authority that must be recognized at every encounter. When he takes up the crown, he spreads decrees and decides who must kneel. Each will he subjugates restores part of the dominion he offers to Crown.",
    combo: "Assume your ruling Form to spread decrees, weaken the enemy line, and raise a throne for your team.",
    passive: "Shattered Authority"
  },
  "a-juiza-de-ferro": {
    lore: "Hell's robe turns authority into obedience. She weighs no guilt and repairs no injustice: she exposes, forbids, and condemns anyone who challenges her dominion.",
    combo: "Expose and seal support with an accusation, then break resistance before the piercing sentence lands.",
    passive: "Might Makes Right"
  },
  "o-trono-vazio": {
    lore: "He turns obedience into power, even far from the throne. His decrees strip others of the right to respond, while his vassals' guard extends Crown's dominion.",
    combo: "Seal the enemy's offense, prepare a response that protects an ally, and strengthen your vassals' guard.",
    passive: "Delegated Authority"
  },
  "o-principe-das-correntes": {
    lore: "He inherited the shackles of a dynasty and made them an instrument of ascent. He binds a soul, tightens the same bond, and gathers the strength to close the prison. To him, Crown's inheritance matters only while someone remains beneath his rule.",
    combo: "Bind a victim, then choose whether to tighten the same shackle or spend your Charges on the prison.",
    passive: "Inherited Shackle"
  },
  "a-regente-de-cinzas": {
    lore: "A colossal matriarch forged from a dynasty’s ashes, she bears the marks of the empire she helped build on her aged face. Her authority is built on forced submission. She uses heated iron as an example to others and keeps her enforcers standing to prolong the Crown’s dominion.",
    combo: "Burn through resistance with the yoke's iron, strengthen your executioners, and punish anyone already burning.",
    passive: "Loyalty Through Fear"
  },
  "o-herdeiro-cativo": {
    lore: "A dynastic soul inhabits this living porcelain effigy, with its long neck and crimson eyes. His chain-link left forearm holds together the fractures that store his ambition. He keeps the shackles to subdue those who follow; every lost shard strengthens his claim to Crown’s throne.",
    combo: "Turn lost Health into a stronger fist; recover or spend your Charges to seize the throne.",
    passive: "Chained Ambition"
  },
  "o-sussurro": {
    lore: "This short, broad amphibian spirit trades secrets along Deceit’s canals. The vocal sac beneath his jaw mixes words with poison; his iron fan collects what the victim still keeps. Beneath heavy lids, his jade eyes follow the trust he has just corrupted.",
    combo: "Plant a secret that punishes the victim's next attack, then collect Essence.",
    passive: "Secret in Circulation"
  },
  "a-mascara-dupla": {
    lore: "She offers one face to earn trust and keeps the other for betrayal. Each mask changes the response she prepares while her victim believes they have learned her intentions. She lives on the certainties Deceit lets her fabricate for a moment.",
    combo: "Lend one face to mark a target, change your response, then reveal the betrayal when they lower their guard.",
    passive: "Second Face"
  },
  "o-tecelao-de-mentiras": {
    lore: "He weaves incompatible versions of one event into a web of spiritual threads. He traps those who try to escape the contradictions, then undoes his own knots to free his accomplices from afflictions. He always keeps one thread out of sight.",
    combo: "Trap the opponent in your web, then choose whether to continue the control or undo the net to cleanse your team.",
    passive: "Patient Web"
  },
  "a-boca-de-vidro": {
    lore: "A serpent of spiritual glass, she hides in the contradictions of her own reflections. Her hiss slips through a guard, exposes a victim, and unravels an enemy reserve. She whispers of exits that never existed, leading victims toward a gap in their own defense.",
    combo: "Repeat your hiss to build damage up to its limit; Stun breaks the sequence.",
    passive: "Fractured Truth"
  },
  "o-falso-profeta": {
    lore: "He presents as revelation what he prepared to gain obedience. Manufactured blessings build his strength, turning others' expectations into an offensive miracle. When the deception threatens to collapse, confession gives him the breath to begin again.",
    combo: "Build Charges with the false blessing, then confess to recover or manufacture an offensive miracle.",
    passive: "Misguided Faith"
  },
  "o-corretor-de-memorias": {
    lore: "He alters memories and bargains over the versions that survive the forgery. He mortgages the past, removes the support that kept a victim standing, and collects the memory he marked. His files preserve the stories Deceit found useful.",
    combo: "Mortgage a memory and erase the victim's support options before settling the past.",
    passive: "Stolen Archive"
  },
  "o-incendiario": {
    lore: "He prepares the fuse before letting rage take over. His Flame punishes hesitation and scatters sparks until the moment is right to detonate. He feeds Flame by turning every pause into a threat of revenge.",
    combo: "The fuse punishes a victim who takes no action; they must act while you prepare the detonation.",
    passive: "Lit Fuse"
  },
  "a-brasa-eterna": {
    lore: "She keeps the heat of an insult long after its source is gone. Burn persists beneath the ashes, choking resistance and gathering in a furnace when resentment finds an outlet. Her constancy gives Flame's hatred time to consume.",
    combo: "Keep Burn active and take the choking Form: pressure the whole line, control the heat, then consume the condition in a furnace.",
    passive: "Persistent Heat"
  },
  "o-odio-encarnado": {
    lore: "He gives passage to a fury that changes the violence of his own blows. The more he feeds it, the harder it becomes to sustain the Form that contains it. The finale turns the pressure back on his own body and spreads the hatred that strengthens Flame.",
    combo: "Feed your hatred to transform your attacks for two turns; the finisher ends the fury and costs Health.",
    passive: "Unrestrained Rage"
  },
  "o-filho-da-cinza": {
    lore: "He keeps every insult as an ember that refuses to die. He gathers the ashes to restore his strength and returns resentment as fire, feeding Flame's vengeance.",
    combo: "Gather resentment until your first technique rekindles; spend your reserve to recover Health or return the flame.",
    passive: "Latent Resentment"
  },
  "a-pira-errante": {
    lore: "She turns every resistance into another reason to widen the punishment. Each insult leaves an ember in her lantern, feeding a siege of fire until Flame's revenge consumes whoever defies her.",
    combo: "Apply Burn and raise your vengeful guard; if a new attack breaks through, unleash your revenge on that enemy.",
    passive: "Armored Resentment"
  },
  "o-coracao-em-furia": {
    lore: "Every insult becomes burning pressure. Anger quickens his pulse and empowers the next discharge, but forcing his body past its limit costs him his own integrity. He feeds Flame with hatred he refuses to keep inside.",
    combo: "Lost Health builds the boil and empowers your next strike; balance that pressure against the discharge of your Charges.",
    passive: "Angry Pulse"
  },
  "o-devorador": {
    lore: "A four-legged beast of Hunger whose appetite knows no end. It gnaws through victims' guards with spiritual saliva and absorbs the Essence it devours. When wounded, its hunger reaches beyond flesh and into enemy reserves.",
    combo: "Your hunger shifts with your Health: while wounded, pierce Defense and drain Essence; once recovered, bite again.",
    passive: "Growing Hunger"
  }
};

Object.assign(characterCopy, {
  "a-mao-que-toma": {
    lore: "She turns another soul's deprivation into her own wealth. Her spiritual plunder buys protection and vigor; the theft ends only when nothing remains to take.",
    combo: "Steal Essence and gather plunder; spend your reserve to recover Health or strengthen the seizure.",
    passive: "Insatiable Possession"
  },
  "o-estomago-sem-fundo": {
    lore: "He devours the protection others have built and makes their spoils part of his own body. Nothing satisfies him: even a soul's guard becomes food for Hunger's next claim.",
    combo: "Consume enemy Defense to build your own guard; gather Essence, then spend it on affliction damage.",
    passive: "Assimilation"
  },
  "a-senhora-do-ultimo-pao": {
    lore: "She hoards the sustenance others lack. She feeds her own only to keep them dependent; every ration strengthens the Bond of Hunger.",
    combo: "Drain Essence with the mark of deprivation, sustain your dependent allies, and collect tribute from the marked target.",
    passive: "Profit of Deprivation"
  },
  "o-credor": {
    lore: "He turns another soul's need into a contract that never stops collecting. Each technique the victim uses can accrue more interest until the debt becomes an announced execution. Hunger thrives on the dependencies he preserves.",
    combo: "Sign a debt that collects on the victim's next technique; choose between interest and executing the contract.",
    passive: "Interest of the Soul"
  },
  "a-balanca-vazia": {
    lore: "She offers sustenance like a lender calculating a future claim. Her aid grows with the need, but serves only to preserve dependency. As hardship deepens, she expands her own offense.",
    combo: "Drain the enemy reserve and sustain a wounded ally; the seizure punishes enemies weakened by lost Health.",
    passive: "Profit of Need"
  },
  "o-apodrecido": {
    lore: "He carries a decay that advances through flaws in spiritual matter. His touch hinders recovery and makes a guard give way before decomposition. What survives the first pass keeps coming apart beneath Rot's influence.",
    combo: "Reduce healing received with Decay; choose whether to erode the guard or finish the decomposition.",
    passive: "Flesh in Ruin"
  },
  "a-praga-andante": {
    lore: "She chooses each path by how many souls she can infect. The spreading contagion feeds her vitality, then returns in a concentrated dose to an already poisoned victim, carrying Rot wherever she goes.",
    combo: "Spread Poison, then concentrate the contagion in its returning Form; the pestilent crisis interrupts an infected victim.",
    passive: "Plague Host"
  },
  "o-corrupto": {
    lore: "He offers bargains whose trust was broken from the start. He marks the other party and turns a broken pact into protection for himself, extending the advantage over those who believed him. Every ruined promise feeds Rot.",
    combo: "Break trust to turn some damage dealt into your own Defense; collect the marked corruption as affliction damage.",
    passive: "Profit from Ruin"
  },
  "a-rainha-dos-fungos": {
    lore: "She makes every soul she reaches a possible shelter for her colony. She keeps her hosts beneath the mycelium and gathers spores for a harvest that can sustain her accomplices or infect her opponents. The life she cultivates exists to spread Rot.",
    combo: "Seed a colony, then choose your harvest: protect the living or spread offensive spores.",
    passive: "Living Colony"
  },
  "o-medico-de-vermes": {
    lore: "He treats souls as hosts for his colonies. He keeps his accomplices alive to sustain the infestation and draws vitality from the infected, spreading Rot's corruption.",
    combo: "Inoculate an enemy with Poison to drain them; keep allied hosts alive with cleansing and regeneration.",
    passive: "Corrupted Symbiosis"
  },
  "o-jardim-morto": {
    lore: "He spreads roots that steal vigor and corrupt spiritual matter. His accomplices shelter within necrotic webs while each attack feeds a corrosive response. His will is to make Rot advance over everything that still resists.",
    combo: "Apply Decay, wrap your team in the web, and return part of each attack as affliction damage; collective withering weakens infected foes.",
    passive: "Corrosive Sap"
  },
  "o-que-observou": {
    lore: "He witnessed suffering and chose to remain at the edge of it. He keeps other people's failings as weapons, never answering their calls for help.",
    combo: "Record a victim, refuse to intervene, then turn your observation Charges into spiritual retaliation.",
    passive: "Watchful Indifference"
  },
  "a-porta-fechada": {
    lore: "She decides who must stay outside. She shelters her accomplices while turning another's helplessness into a prison without reply.",
    combo: "Close off the victim's support without stopping their attacks; mark the door and interrupt them at the right moment.",
    passive: "Accomplices' Shelter"
  },
  "o-surdo": {
    lore: "He is not unable to hear; he chooses to extinguish the answer. His presence smothers cries and interrupts anyone who tries to break Silence's neglect.",
    combo: "Weaken the enemy voice, interrupt its action, then extend the affliction or release the decree.",
    passive: "Smothered Cry"
  },
  "a-testemunha-cega": {
    lore: "She knows what happened and withholds her testimony when it could make a difference. She reveals an opening only when doing so serves her own survival.",
    combo: "Your memory reacts to spiritual and affliction techniques, returning damage and stealing Essence; reveal yourself to prepare a piercing testimony.",
    passive: "Veiled Complicity"
  },
  "o-quarto-vazio": {
    lore: "A spectral host offers an entrance and denies every welcome. His presence projects empty corridors where no plea for help finds an answer.",
    combo: "Your empty presence punishes the victim's next support with damage and lost Essence; collective absence drains what remains.",
    passive: "Welcome Denied"
  },
  "o-vigia-ausente": {
    lore: "He deliberately abandoned those he was meant to guard. Now he waits for a soul to be left without aid before striking from behind. His lantern lights only after help has been refused.",
    combo: "Exploit the abandoned guard; negating an attack opens a strike from behind against whoever dealt it.",
    passive: "Opportunism"
  },
  "o-que-possui": {
    lore: "He embodies Flesh's abusive possession. His spiritual bond imposes commands and takes vitality from anyone he marks.",
    combo: "Possession seals attacks for one action but still allows support; interrupt the marked victim or drain their Health.",
    passive: "Possessive Claim"
  },
  "a-pele-alheia": {
    lore: "She makes her own skin an instrument of invasion. She takes Forms from other souls, shifts between protection and blade, then discards each shell when it no longer serves her will to dominate.",
    combo: "Switch between your original Form, the offensive Usurped Skin, and the defensive Usurped Carapace. Each body has three techniques and its own portrait; discard the shell or use Body Double to return to your original Form.",
    passive: "Predatory Adaptation"
  },
  "o-desejo-quebrado": {
    lore: "He sees another soul's integrity as something to consume and deform. He pushes his own body past its limit to invade another's space and impose the abuse that feeds Flesh.",
    combo: "Turn lost Health into offensive pressure; break through an enemy guard and spend your Charges on a piercing strike.",
    passive: "Profane Hunger"
  },
  "a-marionetista-de-nervos": {
    lore: "She fastens spiritual threads to another body's responses. She sustains her command while the victim tries to regain control, then chooses when to snap the link in pain. Every imposed gesture extends the abuse that empowers Flesh.",
    combo: "Connect the nerves, then keep control for one more action or snap the threads for a finishing blow.",
    passive: "Tightened Strings"
  },
  "o-espelho-carnal": {
    lore: "He plants copies of his own substance inside other bodies, turning pain into a returning attack. His aid preserves the body as an instrument of control, extending the abuse that empowers Flesh.",
    combo: "Expose an enemy and sustain an ally with the parasitic link; pain received triggers an affliction response.",
    passive: "Echo of Pain"
  },
  "a-costureira": {
    lore: "She sees bodies and decisions as stitches she can tighten or undo. She repairs allies to keep control and opens the seams of a marked victim.",
    combo: "Mark and wound with the thread; mend your allies, then undo the victim's stitches with the finisher.",
    passive: "Anchoring Stitch"
  },
  "o-que-apaga": {
    lore: "He removes whatever lets a soul sustain its resistance. He dissolves guards and advantages, marks what remains, then focuses his final nullification on that trace to widen Void's erasure.",
    combo: "Mark and strip away advantages; the setup unlocks a special nullification against that victim, while your second technique dissolves Defense.",
    passive: "Proof of Erasure"
  },
  "a-ausencia": {
    lore: "She leaves a gap where a soul expected to find support, vigor, or continuity. Her passage consumes a victim's reserve and deepens the loss when they hesitate to act. The emptiness spreads until her own presence is impossible to reach.",
    combo: "Drain Essence and leave an absence that exacts a greater toll if the victim takes no action on their turn.",
    passive: "Lack of Substance"
  }
});

Object.assign(characterCopy, {
  "o-fim-silencioso": {
    lore: "A manifestation of Void that heralds the loss of all continuity. Its blade breaks a victim's will before extinguishing their presence.",
    combo: "Save your two strongest sentences for wounded enemies; after they fall, Silence changes its shape.",
    passive: "Final Moment's Due"
  },
  "o-menino-sem-sombra": {
    lore: "An adult entity that chooses to extinguish every possibility of continuity. Whatever it touches loses shape and purpose; it rebuilds its presence from the traces of the certainties it destroyed.",
    combo: "Gather traces of ruin and consume them to erase an enemy's presence; at low Health, your recovery takes another Form.",
    passive: "Penumbra's Remnant"
  },
  "a-ultima-pagina": {
    lore: "She inscribes names on spiritual fragments to narrow a soul's possibilities. She erases the will to respond and ends the trace she marked, turning each lost continuity into strength for Void.",
    combo: "Inscribe and expose a victim, interrupt their offense, then consume the mark to end their trace.",
    passive: "Erasure Cycle"
  },
  "o-lugar-de-ninguem": {
    lore: "His presence unravels places that might have sheltered another soul. He erases the path's landmarks, weakens those who still resist, and absorbs what remains into his own outline, expanding Void.",
    combo: "Erase the field to punish inaction; mark a position, weaken the victim, then consume their trace to recover Health.",
    passive: "Fuel for Erasure"
  },
  "o-escudo-vivo": {
    lore: "He chose to stand between danger and those who need to cross. He gathers his guard before advancing, turning the resistance he stores into a response from his aegis. His shelter gives Protection a line that can still hold.",
    combo: "Raise your guard, then choose between a quick advance and the aegis's stronger response.",
    passive: "I Will Stand Here"
  },
  "a-muralha": {
    lore: "A human-shaped construct that chose to become a shelter. Every attack that slips past an ally's guard strengthens its plates; it advances only to make room for those it must protect.",
    combo: "Fortify your team and gather Charges; spend your Defense to expose an enemy, while damage to allies can rebuild your guard.",
    passive: "Stone Upon Stone"
  },
  "o-que-ficou": {
    lore: "He chooses to stay when retreat would be safer. His strength comes from the shelter he offers: he gives some of his own breath to protect another soul and holds the line as long as someone still needs to cross.",
    combo: "Give up some Health to shelter an ally, then sustain yourself with an offensive response that grows stronger when wounded.",
    passive: "A Presence That Endures"
  },
  "o-ultimo-guardiao": {
    lore: "A four-legged spirit sheltered in a shell of living stone. It stands at Protection's threshold so other souls can cross safely. Its horn marks danger; its plates offer shelter before returning the attack.",
    combo: "While you have destructible Defense, negate a physical or piercing technique, return 30 damage, and generate 1 Grace.",
    passive: "Last Vigil"
  },
  "a-sentinela-azul": {
    lore: "She recognizes when an ally needs room to act. She concentrates the protective line on that soul, restores the rhythm of their techniques, and points out an opening the team can exploit. Her watch keeps Protection ready for the next move.",
    combo: "Focus your team's guard on one ally, protecting them and reducing the cooldowns of their non-defensive techniques.",
    passive: "Watchful Gaze"
  },
  "a-mao-que-cura": {
    lore: "She senses pain a soul tries to hide and reaches it gently. She removes afflictions that interrupt recovery and rebuilds a guard around what remains fragile. The compassion she gives also restores her own breath.",
    combo: "Cleansing harmful conditions also grants Defense; use marked compassion to restore your own Health.",
    passive: "Pain Witnessed"
  },
  "o-restaurador": {
    lore: "He slowly gathers vitality scattered by suffering. He keeps it in reserve until he can return it in a restoration that reaches his companions and clears the afflictions binding them. Each return strengthens the continuity of Healing.",
    combo: "Store healing until it becomes a stronger team-wide restoration that can cleanse your whole team.",
    passive: "Ongoing Restoration"
  },
  "a-luz-que-restaura": {
    lore: "She repairs the threads of vitality broken by suffering. Her presence restores vigor to wounded souls, and the same current of light makes room against whoever threatens to interrupt Healing's care.",
    combo: "Expose the attacker, restore a wounded ally's vigor, then use the vital current to attack and recover your own Health.",
    passive: "Reciprocal Shelter"
  },
  "a-jardineira-das-feridas": {
    lore: "She knows what each soul needs to catch its breath. She draws remedies from spiritual roots and flowers to treat wounds; her thorns hold back aggression while convalescence restores the group.",
    combo: "Prepare your roots to build a reserve; use the infusion to heal your team or the thorns to weaken an attacker.",
    passive: "Everlasting Remedy"
  },
  "o-pulso-sereno": {
    lore: "He hears the uneven rhythm that comes before an attack and answers with a beat that can contain it. His calm weakens violence, restores breath, and interrupts the impulse that threatens care. Healing appears in him as a patient presence.",
    combo: "Disarm an attack: if the victim still strikes, you recover Health; calm remains your strongest control.",
    passive: "Serene Rhythm"
  },
  "o-equilibrio": {
    lore: "A spiritual construct that measures damage before intervening. Its measuring rod sets the bounds of repair and interrupts excess; its authority serves Justice's balance without demanding submission.",
    combo: "Expose excess, offer shelter, and unlock an even-handed response; the piercing verdict punishes the opening you reveal.",
    passive: "Just Measure"
  },
  "a-lamina-justa": {
    lore: "She submits her blade to the discipline of the principle she chose to follow. Each cut reaffirms the last until she finds the precision to stop an attacker. Her strength in Justice depends on how steadily she holds to that choice.",
    combo: "Repeated cuts gain precision up to a limit; Stun breaks the discipline but does not erase your offense mark.",
    passive: "Thread of Principle"
  },
  "o-que-pesa": {
    lore: "He faces the consequence before passing judgment. He gathers the weight of each deed to stop excess with a proportional decision, without resorting to Crown's oppression.",
    combo: "Weigh, judge, and restore balance; your decision prepares a different option for the next cycle.",
    passive: "The Scales' Patience"
  },
  "a-testemunha-integra": {
    lore: "She keeps a record that power would prefer to erase. She exposes advantages built on abuse and gathers the proof other souls need to respond. Her testimony gives Justice a voice that remains whole under pressure.",
    combo: "Your proof punishes active damage bonuses, reduction, and counterattacks before removing them; the record prepares a team-wide testimony.",
    passive: "Undistorted Voice"
  },
  "o-julgador-gentil": {
    lore: "Mercy does not weaken his authority; it defines when to repair and when to stop an attack. His justice preserves the measure that tyrants abandoned.",
    combo: "Restore Health and remove conditions while reducing non-defensive cooldowns; save Weaken for the limit of mercy.",
    passive: "Unshaken Mercy"
  },
  "a-chama-que-nao-apaga": {
    lore: "She tends the last spark when everything around her seems finished. She catches her breath, rekindles her strength, and keeps enough warmth to open a new dawn. Every attempt to carry on strengthens Hope.",
    combo: "Recover your breath to rekindle a different attack, or save your Charges for the dawn.",
    passive: "There Is Still Tomorrow"
  },
  "o-que-levanta": {
    lore: "He embodies Hope's perseverance. He returns to the fight and raises a companion without promising that the crossing will be painless.",
    combo: "Raise an ally; if a new ability damages them during the enemy response, recover your own breath as well.",
    passive: "Rise Again"
  },
  "a-voz": {
    lore: "Song gives shape to the courage one soul lends another. Her voice supports the team and grows louder when perseverance becomes shared.",
    combo: "Begin a hymn to mark several enemies with the chorus, or end it to recover your own voice.",
    passive: "Choir of Courage"
  },
  "o-portador-da-aurora": {
    lore: "He carries the promise of a horizon beyond the present fight. His light restores an ally's clarity, vigor, and time to respond before focusing on the threat. The dawn he brings lets Hope take one more step.",
    combo: "Dawn cleanses, strengthens, and reduces an ally's non-defensive cooldowns; Charges still fuel a piercing horizon.",
    passive: "First Horizon"
  },
  "a-mensageira-do-amanha": {
    lore: "She crosses the fight bearing a promise that someone will arrive. She gives a companion new breath and prepares a response that can restore the most wounded soul. Her message is complete only when someone finds the strength to continue.",
    combo: "Send a breath of hope to unlock a response that turns damage into recovery for your most wounded ally.",
    passive: "Promise of Arrival"
  },
  "o-que-revela": {
    lore: "He directs light at the detail a fabricated advantage tried to hide. He strips away the deception's support and exposes its intent so the team can act with clarity. In Truth, he reveals what sustains the threat.",
    combo: "Light removes advantages and exposes a target even through a counterattack; Invulnerability still protects them.",
    passive: "Nothing to Hide"
  }
});

Object.assign(characterCopy, {
  "a-luz-nua": {
    lore: "She recognizes the true shape beneath fabricated advantages. Her radiance dismantles disguises and reveals the point a lie tried to hide; she restores clarity without turning revelation into cruelty.",
    combo: "Reveal a mark, strip the target's guard and advantages, then focus damage on the enemy you marked.",
    passive: "Without Disguise"
  },
  "o-espelho": {
    lore: "He returns an attack with the image of its own intent. He reveals an opening, accepts the risk of a response, and prepares the shard that will fly back at the author of the blow. The surface he shows in Truth preserves what was actually presented to him.",
    combo: "Reveal an opening and return the intent: an attack against your mirror releases a shard at its author.",
    passive: "Honest Reflection"
  },
  "a-cartografa-da-clareza": {
    lore: "She charts the path that remains after false turns are removed. Her maps do not create territory; they reveal passages, intentions, and vulnerable points, letting other souls advance without deception.",
    combo: "Chart an opening and reveal a sheltering shortcut; gather Charges to focus your convergence on an enemy.",
    passive: "Route Without Deceit"
  },
  "o-olho-desarmado": {
    lore: "He reveals the intent behind a gesture without mistaking clarity for cruelty. He uses that knowledge to restrain an attacker and shelter whoever has been exposed.",
    combo: "Your reading weakens and exposes the victim, punishing their next attack; choose between aiding an ally and disarming the target.",
    passive: "See Without Wounding"
  },
  "o-elo-dourado": {
    lore: "He forges a bond that carries some of the strength won in battle to his companions. His offense opens a cooperative chain, letting one response reach the soul most in need. Union grows through the reciprocity he maintains.",
    combo: "Your offensive bond turns some real damage into healing for your most wounded ally, then marks the final link.",
    passive: "Shared Strength"
  },
  "a-que-une": {
    lore: "She weaves alliances that preserve each soul's will. Her threads join without taking control, keeping Union distinct from Flesh and Deceit's manipulation.",
    combo: "Restore your team's fragments with cleansing, guard, and recovery; choose a focused shelter or a shared reserve of breath.",
    passive: "Care in Concert"
  },
  "o-vinculo": {
    lore: "He chooses to stay beside another soul without taking away their freedom. His pact shelters, answers aggression, and shares recovery among those involved: Union draws strength from freely given loyalty.",
    combo: "Your pact negates one attack; if another damages the ally during the response, you both recover Health. The effect does not duplicate if you are the same soul.",
    passive: "Pact of Staying"
  },
  "os-tres-irmaos": {
    lore: "Three souls kept their own voices inside a shared promise. They alternate between attack, shelter, and a finisher in a rhythm that works only because each gives space to the next. Their brotherhood turns cooperation into the presence of Union.",
    combo: "Rotate three voices in the same slot—attack, shelter, and finisher—without losing your team's other options.",
    passive: "Brotherhood's Step"
  },
  "a-guardia-das-promessas": {
    lore: "She gives strength to promises souls choose freely. If a companion is wounded under her vow, she answers by renewing their shelter; her oath joins their wills without taking anyone's freedom.",
    combo: "Honor a pact with an ally; if they lose Health during the enemy response, unlock a renewed shelter.",
    passive: "Promise Kept"
  },
  "o-que-cria": {
    lore: "He shapes spiritual matter to preserve new possibilities. Each construction can shelter a soul or open a path against whoever would destroy it.",
    combo: "Build shelter to unlock a piercing Form; choose between that strike and Converging Work to spend your Charges.",
    passive: "Persistent Idea"
  },
  "a-semente": {
    lore: "A living plant that preserves possibility among Creation's ruins. She ripens Essence in her core, shelters other souls among living leaves, and blossoms the spiritual mark she left on an attacker. She cultivates new paths where others saw only wreckage.",
    combo: "Your seed ripens with Charges: harvest shelter for yourself or keep the mark to make it sprout in an enemy.",
    passive: "Latent Potential"
  },
  "o-cultivador": {
    lore: "He prepares spiritual matter so life has somewhere to continue. Each furrow already restores breath to a soul, while gathered reserves wait for a choice between a sheltering harvest and branches that restrain the threat. Creation grows through the care he repeats.",
    combo: "Tilling the soul heals your most wounded ally; gather a reserve, then choose a team harvest or offensive branches.",
    passive: "Harvest Cycle"
  },
  "a-arquiteta-verde": {
    lore: "She raises living structures able to sustain new possibilities. She distributes weight between pillars and vaults, choosing when to preserve shelter and when to turn her own work against an attacker. Every structure gives Creation a place to remain.",
    combo: "Raise the vault for focused shelter, or collapse it across the enemy line and spend your guard.",
    passive: "Living Foundation"
  },
  "o-primeiro-canto": {
    lore: "His voice gives rhythm to Creation's spiritual matter, hastening the birth of new possibilities. His song shelters the team and gathers a cadence he can unleash against anyone who threatens new life.",
    combo: "The refrain shortens your team's non-defensive cooldowns; choose when to pay its cost and when to spend Charges on the song.",
    passive: "Echo of Birth"
  },
  "o-passo-interrompido": {
    lore: "He no longer crosses each moment in the order others perceive it. He follows the same victim through steps that arrive early, return, and leave a fissure where continuity failed. Each crossing forces him to gather his presence again in Limbo.",
    combo: "Follow a three-step sequence against one victim, or spend your Charges on the Discontinuous Strike.",
    passive: "Returning Step"
  },
  "a-linha-partida": {
    lore: "A soul of Limbo whose fragments no longer occupy the same moment. Three unstable threads preserve her continuity: she casts them out to break an enemy guard or binds them around an ally, giving up some of her own integrity. Each act of aid draws her fragments farther apart, but she keeps trying to reconnect what she can still reach.",
    combo: "Open one end of the line against an enemy, then reconnect the thread to protect an ally or pull its end through to attack.",
    passive: "Tension of Rupture"
  },
  "o-eco-sem-dono": {
    lore: "Voices that lost their source in Limbo persist in a spiral of mist and broken rings. Faceless and bodiless, the apparition gathers vibrations and returns whatever strikes it. Each chorus unravels it a little unless it finds another soul's resonance to hold on to.",
    combo: "Gather echoes and return an attack to change your team's stance: a light strike, a team cleanse, or a resonance that spends Charges.",
    passive: "Ownerless Resonance"
  },
  "a-porta-que-flutua": {
    lore: "Her passage hangs between destinations that have been torn apart. She finds temporary shortcuts in Limbo's fractures, lends another soul an exit, and loses some of her own stability when she closes a route.",
    combo: "Open a passage, use its shortcut to shelter an ally, and return; closing the route on an enemy also costs your Health.",
    passive: "Suspended Boundary"
  },
  "o-nome-esquecido": {
    lore: "Only syllables remain of a name no memory can complete. His passage strips other souls of their bearings and scatters the Essence they still had. In Limbo, he tries to keep his own outline together as memories continue to give way.",
    combo: "Your lost name drains now and leaves a toll on the victim's next support; erasing their Form prepares an affliction finisher.",
    passive: "Name Dissolving"
  },
  "o-relogio-afogado": {
    lore: "He carries moments that never reached their end. Sunken mechanisms are instruments of his temporal Rupture as he gathers and returns lost seconds.",
    combo: "Gather seconds and stop a target to open a brief window for a concentrated discharge.",
    passive: "Time in Reserve"
  },
  "a-asa-invertida": {
    lore: "She finds momentum in directions where other presences would only fall. She reverses an attack's path and uses the opening to return its imbalance to whoever caused it. Her unstable relationship with gravity follows Limbo's fractures.",
    combo: "Return a physical attack to unlock a strike that seals the attacker; Weaken prepares the fall as well.",
    passive: "Rising Fall"
  },
  "o-andarilho-de-vidro": {
    lore: "Each crossing leaves a footprint of spiritual glass, fragile enough to break and clear enough to guide the next step. The sequence strengthens his advance, but an interruption erases the path he was building. He keeps walking among Limbo's broken moments.",
    combo: "Each footprint strengthens the next up to a limit; Stun breaks the sequence, while the final crossing still costs your integrity.",
    passive: "Hunger of the Penumbra"
  },
  "a-sombra-inconstante": {
    lore: "Her outline shifts between the presence that hunts and the shelter where she tries to recover. She changes state to meet a threat, then returns to the penumbra where she can mark and drain. In Limbo, even a shadow must bargain for the time it can remain.",
    combo: "Take a sheltering outline to recover and counterattack, then return to shadow to mark and drain again.",
    passive: "Penumbra's Hunger"
  },
  "a-ponte-rasgada": {
    lore: "She walks between encounters that never came to completion. She rebuilds a passage for a moment, then breaks the support of whoever blocks the crossing.",
    combo: "An enemy who crosses the bridge's protection reveals an opening; exploit it with a team-wide crossing before it vanishes.",
    passive: "Enduring Span"
  },
  "a-alma-em-suspenso": {
    lore: "A soul caught in a moment that never ended. He gathers breath in Limbo's fractures and binds it to another presence, giving up some of his own integrity. When he releases the anchor, he turns his stored reserve into Rupture.",
    combo: "Gather three Charges to lend breath to an ally, or spend the reserve on Rupture; anchoring and releasing it also cost Health.",
    passive: "Enduring Anchor"
  }
});

const archetypeContexts = {
  "Cria Essência por ação, condição ou evento para alimentar as próximas técnicas do trio.": "Generates Essence through actions, conditions, or events to fuel your team's next techniques.",
  "Concentra dano em uma janela preparada, em um alvo ferido ou numa reserva gasta.": "Focuses damage into a prepared window, against a wounded target, or by spending a stored reserve.",
  "Aplica e prolonga condições para que a equipe converta desgaste em pressão.": "Applies and extends conditions so your team can turn attrition into pressure.",
  "Marca uma abertura e decide quando consumir, explorar ou espalhar a preparação.": "Marks an opening, then chooses when to consume, exploit, or spread the setup.",
  "Atordoa, sela ou enfraquece para abrir uma janela de ação segura.": "Stuns, seals, or weakens enemies to create a safe window for your team.",
  "Atrai, evita ou devolve uma resposta com bloqueio, reação ou contra-ataque.": "Baits, avoids, or returns enemy actions with blocks, reactions, and counterattacks.",
  "Altera o ritmo de toda a linha inimiga ou fortalece o trio em conjunto.": "Changes the pace of the entire enemy line or strengthens your team as a whole.",
  "Drena ou rouba Essência e transforma a reserva roubada numa decisão tática.": "Drains or steals Essence and turns the stolen reserve into a tactical advantage.",
  "Mantém o trio de pé com cura, limpeza e recuperação ligada ao próprio dano.": "Keeps your team standing with healing, cleansing, and recovery tied to your own damage.",
  "Troca segurança por força e ganha opções quando a Vida cai ou é sacrificada.": "Trades safety for power and gains new options as Health falls or is sacrificed.",
  "Cria Defesa e transforma a guarda em tempo para uma resposta própria ou do trio.": "Builds Defense and turns a guard into time for a personal or team response.",
  "Remove Defesa ou converte as camadas do alvo em vantagem ofensiva.": "Breaks Defense or turns an enemy's layers of protection into offensive pressure.",
  "Troca um tipo de Essência por outro para adaptar a reserva à necessidade imediata.": "Trades one type of Essence for another to meet the team's immediate needs."
};

const mechanicEnglish = {
  "Execução encadeada": "Chained Execution", "Resposta ao agressor": "Attacker Response", "Munição limitada": "Limited Ammunition", "Cadência cruzada": "Crossed Rhythm", "Sentença contra apoio": "Support-Punishing Sentence", "Cuidado com sacrifício": "Sacrificial Care", "Forma de domínio": "Dominion Form", "Interdição de apoio": "Support Interdiction", "Autoridade sem corpo": "Bodiless Authority", "Perseguição": "The Hunt", "Comando persistente": "Lasting Command", "Resistência cativa": "Captive Resistance", "Segredo provocador": "Provoking Secret", "Duas máscaras, duas respostas": "Two Masks, Two Responses", "Controle ou amparo": "Control or Shelter", "Discurso crescente": "Rising Oratory", "Fé ou confissão": "Faith or Confession", "Confisco de lembranças": "Memory Seizure", "Pavio que exige resposta": "Fuse That Demands an Answer", "Forma de sufocamento": "Choking Form", "Transformação de risco": "Risky Transformation", "Limiar de cargas": "Charge Threshold", "Defesa em duas camadas": "Two-Layer Defense", "Pressão do coração": "Heart Pressure", "Fome que consome o próprio corpo": "Hunger That Devours Its Host", "Reserva conversível": "Convertible Reserve", "Digestão de Defesa": "Defense Digestion", "Ração repartida": "Shared Rations", "Dívida por ação": "Debt per Action", "Contrapeso da carência": "Counterweight of Need", "Ruína da recuperação": "Recovery in Ruin", "Propagação e foco": "Spread and Focus", "Vantagem parasitária": "Parasitic Advantage", "Desfechos exclusivos": "Exclusive Outcomes", "Sutura viva": "Living Stitch", "Jardim de retaliação": "Retaliation Garden", "Testemunho reativo": "Reactive Testimony", "Tranca seletiva": "Selective Lock", "Interrupção e continuação": "Interrupt and Continue", "Vigília espiritual": "Spiritual Vigil", "Isolamento oportunista": "Opportunistic Isolation", "Emboscada após defesa": "Ambush after Defense", "Posse da ofensiva": "Possession of the Offense", "Metamorfose de três corpos": "Three-Body Metamorphosis", "Desejo de risco": "Risk-Taking Desire", "Controle com ligação": "Tethered Control", "Imagem que sente": "Feeling Image", "Ciclo de cuidado": "Care Cycle", "Apagamento dirigido": "Directed Erasure", "Ausência que cobra espera": "Absence That Punishes Waiting", "Sentenças limitadas": "Limited Sentences", "Refúgio por necessidade": "Shelter in Need", "Rasura de ações": "Action Erasure", "Território que exige movimento": "Territory That Demands Movement", "Guarda em avanço": "Advancing Guard", "Muralha que converge": "Converging Rampart", "Permanência vital": "Vital Persistence", "Guarda contra lâminas": "Blade-Warding Guard", "Proteção de tempo": "Timed Protection", "Cuidado que recompõe": "Restorative Care", "Aprimoramento por reserva": "Reserve-Powered Growth", "Luz dos feridos": "Light for the Wounded", "Cultivo que amadurece": "Maturing Growth", "Serenidade provocada": "Provoked Serenity", "Amparo e cobrança": "Shelter and Claim", "Disciplina da lâmina": "Blade Discipline", "Ciclo de julgamento": "Judgment Cycle", "Prova contra vantagens": "Evidence against Advantages", "Reparação de tempo": "Timed Repair", "Recomeço ofensivo": "Offensive Renewal", "Alento recíproco": "Reciprocal Breath", "Postura de coro": "Chorus Stance", "Aurora que adianta": "Early Dawn", "Entrega que retorna": "Returning Gift", "Revelação incontestável": "Undeniable Revelation", "Vantagens despidas": "Stripped Advantages", "Reflexo preparado": "Prepared Reflection", "Rota de apoio": "Sheltering Route", "Intenção observada": "Observed Intent", "Vínculo que distribui Vida": "Health-Sharing Bond", "União duradoura": "Lasting Union", "Pacto de retorno": "Returning Pact", "Cadeia de três técnicas": "Three-Technique Chain", "Promessa provada": "Proven Promise", "Construção alternativa": "Alternate Construction", "Amadurecimento": "Ripening", "Cultivo partilhado": "Shared Cultivation", "Arquitetura de escolhas": "Architecture of Choices", "Cadência que adianta": "Accelerating Cadence", "Sequência temporal": "Temporal Sequence", "Ruptura e reparação": "Rupture and Repair", "Forma de ressonância": "Resonance Form", "Travessia de volta": "Return Crossing", "Nome que cobra amparo": "A Name That Claims Support", "Janela de execução": "Execution Window", "Inversão de impulso": "Reversed Momentum", "Trilha de estilhaços": "Trail of Shards", "Sombra que se recolhe": "Receding Shadow", "Ponte de contragolpe": "Counterblow Bridge", "Suspensão partilhada": "Shared Suspension"
};

const baseFormEnglish = {
  "Corpo Saciado": "Sated Body", "Máscara de Confiança": "Mask of Trust", "Fúria contida": "Contained Fury", "Coroa Fraturada": "Fractured Crown", "Brasa Velada": "Veiled Ember", "Eco Encarnado": "Embodied Echo", "Sombra errante": "Wandering Shadow", "Forma original": "Original Form"
};

const bodyFormEnglish = {
  "o-devorador": [{ name: "Hunger Without a Body", description: "This Form appears automatically at 50 Health or less. The chest opens into a void, and Soul Bite begins draining its victim." }],
  "a-mascara-dupla": [{ name: "Mask of Betrayal", description: "Borrowed Face reveals the second mask for up to 2 turns. Another Face interrupts and counterattacks; when the duration ends, the mask returns." }],
  "o-odio-encarnado": [{ name: "Unleashed Hatred", description: "A transformation lasting 2 turns. Unrestrained Resentment ends the Form and restores the portrait." }],
  "o-soberano-quebrado": [{ name: "Sovereign Crown", description: "For 2 turns, the decree changes all three techniques: mark the line, weaken it in an area, and raise Defense for your team." }],
  "a-brasa-eterna": [{ name: "Sepulchral Furnace", description: "With Burn prepared, your first three techniques change for 2 turns: a focused blaze, Ash across the enemy line, and a way to consume the condition." }],
  "o-eco-sem-dono": [{ name: "Stolen Resonance", description: "Negating a physical technique opens a complete response kit for 2 turns: a strike that builds Charges, team shelter, and an area discharge." }],
  "a-pele-alheia": [
    { name: "Usurped Skin", description: "A piercing blade, a reprisal, and a discarded shell that restores Health." },
    { name: "Usurped Carapace", description: "A guard, a counterattack, and a protected impact." }
  ],
  "a-sombra-inconstante": [{ name: "Sheltering Outline", description: "Replaces the opening attack with recovery and a counterattack until you Resume the Shadow." }]
};

const phrases = {};
for (const character of characters) {
  const copy = characterCopy[character.id];
  if (copy?.lore && character.lore) phrases[character.lore] = copy.lore;
  if (copy?.combo && character.combo) phrases[character.combo] = copy.combo;
  if (copy?.passive && character.passive?.name) phrases[character.passive.name] = copy.passive;
  if (archetypeContexts[character.archetypeContext]) phrases[character.archetypeContext] = archetypeContexts[character.archetypeContext];
  if (character.mechanic && mechanicEnglish[character.mechanic]) phrases[character.mechanic] = mechanicEnglish[character.mechanic];
  if (character.baseFormName && baseFormEnglish[character.baseFormName]) phrases[character.baseFormName] = baseFormEnglish[character.baseFormName];
  for (const [index, form] of (character.bodyForms || []).entries()) {
    const translation = bodyFormEnglish[character.id]?.[index];
    if (translation) {
      phrases[form.name] = translation.name;
      phrases[form.description] = translation.description;
    }
  }
}

Object.assign(phrases, {
  "Lança da Primeira Luz": "Spear of the First Light",
  [FINAL_BOSS.title]: "King of Hell",
  [FINAL_BOSS.lore]: "The End has no fixed face or Form. It always takes the shape of its observer's greatest fear: each witness sees a unique manifestation, even when several souls look upon it at once.",
  [FINAL_BOSS.artNote]: "The original Form keeps its approved appearance: a slender, faceless sovereign with a crown, broken bonds, and ivory overtaken by roots. The Tyrant becomes a prison bastion; the Predator, a low six-limbed beast; the Ruin, a broken, suspended cathedral arch. No appearance is its true Form.",
  [FINAL_BOSS.mechanic]: "Three Manifestations of Fear",
  [FINAL_BOSS.combo]: "In its original Form, choose a manifestation. Each one changes the portrait, techniques, archetype, Essence, and entry effect. The Tyrant controls and protects with Ash; the Predator hunts and executes with Rupture; the Ruin wears down and seals with Grace. Unreachable End restores 10 Health and returns to the original Form. Cooldowns belong to each slot and carry across Forms.",
  "Forma original": "Original Form",
  "Assumir Tirano": "Assume the Tyrant",
  "Assumir Predador": "Assume the Predator",
  "Assumir Ruína": "Assume Ruin",
  "Fim Inalcançável": "Unreachable End",
  "Fica Invulnerável a novas habilidades inimigas por 1 turno, recupera 10 de Vida e retorna à forma original. Aflições já ativas continuam. Não reinicia recargas.": "Become Invulnerable to new enemy abilities for 1 turn, restore 10 Health, and return to your original Form. Existing afflictions remain active. Cooldowns do not reset."
});

const finalBossForms = [
  ["Tirano", "Tyrant", "Interditor · afinidade Cinza. Marca e interrompe um alvo, depois protege o trio. Medo de ser subjugado.", "Disruptor · Ash affinity. Marks and interrupts one target, then protects the team. Fear of subjugation."],
  ["Predador", "Predator", "Executor · afinidade Ruptura. Persegue uma presa, recupera Vida e escolhe entre drená-la ou consumir sua marca. Medo de ser caçado.", "Executor · Rupture affinity. Hunts one prey, restores Health, and chooses between draining it or consuming its Mark. Fear of being hunted."],
  ["Ruína", "Ruin", "Especialista em Aflições · afinidade Graça. Aplica Decadência, sela apoio e corrói a linha inimiga. Medo de perder a própria continuidade.", "Affliction Specialist · Grace affinity. Inflicts Decay, seals support, and wears down the enemy line. Fear of losing continuity."]
];
for (const [sourceName, targetName, sourceDescription, targetDescription] of finalBossForms) {
  phrases[sourceName] = targetName;
  phrases[sourceDescription] = targetDescription;
}

const finalBossAbilityNames = {
  "Fenda do Véu": "Veil Rift", "Decreto do Fim": "Final Decree", "Coroa que Não Cai": "Unfallen Crown",
  "Rastro Faminto": "Hungry Trail", "Ceifar o Vínculo": "Reap the Bond", "Fome dos Reinos": "Hunger of the Realms",
  "Cinza de Ninguém": "Ash of No One", "Nome Extinto": "Extinguished Name", "Última Fronteira": "Last Frontier"
};
const finalBossAbilityDescriptions = {
  "Rasga a guarda e marca um inimigo por 3 turnos.": "Rends the guard and Marks one enemy for 3 turns.",
  "Causa 20 de dano. Contra sua marca do Fim, causa +15 de dano, Atordoa por 1 turno e consome a marca.": "Deal 20 damage. Against your End Mark, deal +15 damage, Stun for 1 turn, and consume the Mark.",
  "Concede 20 de Defesa destrutível ao trio.": "Grant the team 20 destructible Defense.",
  "Causa 15 de dano físico, rouba 50% do dano causado como Vida e marca o alvo por 3 turnos.": "Deal 15 physical damage, restore 50% of damage dealt as Health, and Mark the target for 3 turns.",
  "Causa 25 de dano perfurante e rouba 50% do dano causado como Vida. Contra sua marca de caça, causa +10 de dano e consome a marca.": "Deal 25 piercing damage and restore 50% of damage dealt as Health. Against your Hunt Mark, deal +10 damage and consume the Mark.",
  "Causa 20 de dano de aflição a um inimigo e drena 1 Essência da reserva inimiga. Contra sua marca de caça, causa +15 de dano e a consome.": "Deal 20 affliction damage to one enemy and drain 1 Essence from the enemy reserve. Against your Hunt Mark, deal +15 damage and consume it.",
  "Causa 10 de dano de aflição e aplica Decadência: 4 de dano por 3 turnos.": "Deal 10 affliction damage and inflict Decay: 4 damage for 3 turns.",
  "Causa 15 de dano espiritual, deixa o alvo Exposto e sela suas habilidades de apoio por 1 turno.": "Deal 15 spiritual damage, Expose the target, and seal its support techniques for 1 turn.",
  "Causa 20 de dano de aflição a cada inimigo; causa +5 contra alvos com aflições.": "Deal 20 affliction damage to each enemy; deal +5 damage to targets with an affliction."
};
for (const [index, ability] of createFinalBossAbilities().entries()) {
  if (index < finalBossForms.length) {
    const [, targetName, , targetDescription] = finalBossForms[index];
    const entryEffect = ["Gain 10 Defense when entering this Form.", "Gain +8 damage for your next strike on entry.", "Generate 1 Grace when entering this Form."][index];
    phrases[ability.name] = `Assume the ${targetName}`;
    phrases[ability.description] = `Assume the ${targetName}, replace your first three techniques and portrait. ${entryEffect} ${targetDescription} This Form remains until you use Unreachable End.`;
    for (const form of ability.forms || []) {
      if (finalBossAbilityNames[form.name]) phrases[form.name] = finalBossAbilityNames[form.name];
      if (finalBossAbilityDescriptions[form.description]) phrases[form.description] = finalBossAbilityDescriptions[form.description];
    }
  } else {
    phrases[ability.name] = "Unreachable End";
  }
}
for (const [index, form] of FINAL_BOSS.bodyForms.entries()) {
  phrases[form.name] = finalBossForms[index][1];
  phrases[form.description] = finalBossForms[index][3];
}

export const englishCharacterPhrases = phrases;
