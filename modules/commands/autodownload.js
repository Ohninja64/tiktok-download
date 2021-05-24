const Discord = require('discord.js')
const { SlashCommand } = require('slash-create')

const client = require('../../bot')
const ServerOptions = require('../mongo')
const add = require('../counter')

module.exports = class Progress extends SlashCommand {
  constructor (creator) {
    super(creator, {
      name: 'autodownload',
      description: 'Set whether to automatically download TikToks. No command necessary.',
      options: [
        {
          type: 5,
          name: 'enabled',
          description: 'Whether this is enabled or not.',
          required: true
        },
        {
          type: 5,
          name: 'deletemessage',
          description: 'Delete the message with the URL in it.',
          required: false
        },
        {
          type: 5,
          name: 'smartdelete',
          description: 'When enabled, the message will not be deleted if there is more than just the URL in it.',
          required: false
        }
      ]
    })
  }

  async run (interaction) {
    const hasPerms = (await client.guilds.cache.get(interaction.guildID).members.fetch(interaction.user.id)).hasPermission('ADMINISTRATOR')

    if (!hasPerms) {
      throw new Error('You must have the ADMINISTRATOR permission to change settings.')
    }

    add('interactions')

    const serverOptions = await ServerOptions.findOneAndUpdate({ serverID: interaction.guildID }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })
    const args = interaction.data.data.options.reduce((a, b) => {
      a[b.name] = b.value
      return a
    }, {})

    serverOptions.autodownload.enabled = args.enabled
    serverOptions.autodownload.deletemessage = args.deletemessage
    serverOptions.autodownload.smartdelete = args.smartdelete

    await serverOptions.validate()
    await serverOptions.save()

    const message = args.enabled ? ':white_check_mark: Auto Download Enabled :white_check_mark:' : ':x: Auto Download Disabled :x:'

    interaction.send({ embeds: [new Discord.MessageEmbed().setTitle(message).setColor(serverOptions.color).toJSON()] })
  }
}