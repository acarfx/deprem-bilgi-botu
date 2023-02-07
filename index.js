const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
let client = global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
      ],
      shards: "auto",
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
      ],
})

const moment = require('moment');

client.on('ready', async () => {
    let sunucu = client.guilds.cache.get("bildirilcek sunucu id");
    if(!sunucu) return console.log("Sunucu bulunamıyor."); 
    let deprem_bilgi_kanalı = sunucu.channels.cache.get("bildirilecek kanal id")
    if(!deprem_bilgi_kanalı) return console.log("Bilgi kanalını bulamıyorum ve bilgi atamıyorum.");
    deprem_getir(sunucu, deprem_bilgi_kanalı)
    setInterval(() => {
        deprem_getir(sunucu, deprem_bilgi_kanalı)
    }, 850);
})

async function deprem_getir(guild, channel) {
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    
    const adapter = new FileSync('deprem.json');
    const db = low(adapter)
    let embed = new EmbedBuilder()
        .setAuthor({name: guild.name, iconURL: guild.iconURL({dynamic: true})})
      
    ;
     try {
        let res = await fetch('https://api.orhanaydogdu.com.tr/deprem/live.php?limit=1')
        res = await res.json();
        if(res && res.status) {
            
            let data = res.result[0]
            let son_deprem = await db.get("last_deprem").value();
            let mesaj_id = await db.get("mesaj_id").value();
            if(data.timestamp == son_deprem) return;
            await db.set("last_deprem", data.timestamp).write();
            embed.setDescription(`${data.lokasyon}\n\nBüyüklük: ${data.mag}\nDerinlik: ${data.depth}km\nEnlem: ${data.lat}\nBoylam: ${data.lng}\nZaman: <t:${data.timestamp}> (<t:${data.timestamp}:R>)\n\nKordinat Bilgileri: ${data.coordinates ? data.coordinates.join(", ") : "Bulunamadı!"}`)
            let mesaj_bul = await channel.messages.fetch(mesaj_id);
            console.log("Yeni Deprem Bildirildi!")
            if(mesaj_bul && mesaj_id) {
                mesaj_bul.edit({content: `${data.mag < 5 ? `Artçı` : `Sarsıntı & Deprem`} Meydana Geldi!`, embeds: [embed]})
            } else {
                if(channel) channel.send({content: `${data.title} - ${data.mag < 5 ? `Artçı` : `Sarsıntı & Deprem`}`, embeds: [embed]}).then(async (msg) => {
                    await db.set("mesaj_id", msg.id).write();
                })
            }
            
        }
     } catch (err) {
      
     }
}

client.login("token giriniz");