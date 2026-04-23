import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

/*
 * Backfills 48 event ↔ sponsor pairings. The first 45 come from the March
 * 2026 export that was never loaded during the Directus → Adonis migration.
 * The last three are venue-inferred mappings for events that were missing
 * from the export's `event_sponsors` table — each venue literally matches
 * (or clearly abbreviates) an existing sponsor's name: Novity, Extension
 * Interactive, and PGD = Publicis Global Delivery. The heuristic is the
 * same pattern that holds for ~75% of the pre-existing links in the source
 * data.
 *
 * Uses INSERT … ON CONFLICT … IGNORE so it is safe to re-run and won't
 * clobber links added via the admin UI.
 */
const LINKS: Array<[string, string]> = [
  ['611f226b-989b-469e-851b-f130cf6c2a8a', '35bac92e-5a64-4c0d-99a8-649669f040ea'],
  ['d07a38e9-0b80-47b6-b3b0-5a74669f6b97', 'b0a134e2-cd9a-4c2f-bb16-2351444e15f3'],
  ['0108a5a9-431d-4383-976e-5520cd1ed872', '19109e0a-1ded-4aeb-b6f0-2f5b93c86ebf'],
  ['7e701104-42d7-453b-9c95-c7ca321cdbb1', '472b862b-bbf9-45d4-b0d5-f8e48129e086'],
  ['2b614c21-212c-4880-a85c-099396063e96', 'ff6ab3ac-2783-495f-bd14-322696c73e43'],
  ['b1d6162c-a935-4172-8d4d-530cc3153505', 'b88596dd-9e39-4e8e-8c8a-93d113e72766'],
  ['23006e46-631d-46be-8cc8-61628c7986b7', '4fcbf1ea-3202-4b63-aa1f-5f30ea7079e1'],
  ['0a488d48-4be3-4251-8850-c1d63cc66344', '091e78bb-e552-49d4-af33-4f26a5c4fcd0'],
  ['a8867239-f804-477e-8d9f-59a8ad90a62d', 'c86bb34d-07ca-48dd-ad23-b66291a4f89e'],
  ['82209fa2-9275-41d4-972a-91c1f5c6fa3a', '2169db43-9cff-4715-aa0e-47cc49846dc6'],
  ['babc4e4a-49bd-4ea1-9b5f-265f8a842155', '3af10d5f-270b-423d-a8a3-54d4158cf693'],
  ['141ce8e0-38ec-4d72-bbe1-ec839efa3aa4', '8026b777-d365-493f-abca-d6675ff00473'],
  ['74f761f3-cd46-4e44-b77d-3114c455d69e', '2a43f088-f18e-422f-b934-e29efea7c740'],
  ['5dd1b5b8-dbcb-4717-ace1-971249c33c73', '2a43f088-f18e-422f-b934-e29efea7c740'],
  ['7e7658ac-a75d-4cac-b35c-33c7f71cbc5f', 'd160d525-b410-4fc7-89ba-11c1d7c04d37'],
  ['60d4d1f7-e3d7-490c-bd4b-eac9657b2e31', 'd160d525-b410-4fc7-89ba-11c1d7c04d37'],
  ['29f1c13c-afd6-4ff2-b3a1-bc26b5d48ca2', 'e2374089-9649-4d29-a309-61b82c6a34b3'],
  ['5682973d-058d-4b5a-bcb0-498e062c023f', 'd9679f3a-8af6-441b-9d32-a5600ce0b36f'],
  ['9546351e-419a-4037-8893-9d53cfe065bc', '81ad6c97-6038-4784-9c74-1f0b55813f60'],
  ['9546351e-419a-4037-8893-9d53cfe065bc', 'f9e15509-5c8b-48bd-b94e-7770302247d0'],
  ['9546351e-419a-4037-8893-9d53cfe065bc', '75fe83cf-88c8-47c0-954e-3da839da9dba'],
  ['5c20e4f5-282a-4624-b8ff-d159cbd02bed', 'be28fb78-e00c-4b8f-8337-b4f41e7343fc'],
  ['510707fd-a919-49a2-8a45-c99e7f070b68', 'a69c7d69-b06a-467b-826a-7d81f1e5c7fa'],
  ['510707fd-a919-49a2-8a45-c99e7f070b68', '3f3f88bc-c06f-4906-a3c7-f76fdb181b28'],
  ['b4fa1521-7796-4e63-b124-5c7be593feec', '5ef4d6a0-7451-4a1a-8bc2-c45c569ec3b9'],
  ['b4fa1521-7796-4e63-b124-5c7be593feec', 'f95d7284-812d-4718-8dba-525ebf4ce6a9'],
  ['d08ac7e8-c487-4dad-a21b-17866520f336', '6f9045eb-7259-4493-8ca4-8ecafb7a1194'],
  ['fa869827-0804-4e58-9f85-d435006cd5d6', '6f9045eb-7259-4493-8ca4-8ecafb7a1194'],
  ['421b51c8-9bf4-44a6-a812-995eac969ae8', '87e136d4-e372-42b2-bfd8-8b9c8733337f'],
  ['c69787ad-a26d-4cc0-8605-b610f9c3b8f7', '21230235-e5a0-49f4-9a78-053f10c07906'],
  ['e17f0936-d401-4b18-ab81-46b9963ca821', '21230235-e5a0-49f4-9a78-053f10c07906'],
  ['2abdce2b-4bd2-40f7-a3c9-2c144163bfae', '8258c629-5b86-4a4a-8b5a-817a3d98b023'],
  ['60d4d1f7-e3d7-490c-bd4b-eac9657b2e31', '8258c629-5b86-4a4a-8b5a-817a3d98b023'],
  ['9d06df5b-d2e4-4011-ad9e-0cfd738d7a7c', '1701aac0-9fd0-4730-a555-cc9eadf0d624'],
  ['a3520c07-1f06-4721-9e00-5f88e19dad8a', '6dc18fc4-81a3-4457-8234-d2b551d163e1'],
  ['1cd2fb8d-d2ba-4c5c-81d3-ac58360c6378', '6dc18fc4-81a3-4457-8234-d2b551d163e1'],
  ['1cd2fb8d-d2ba-4c5c-81d3-ac58360c6378', 'f74eb8de-fcfd-4c40-bada-c72394189b41'],
  ['cf2c909d-6807-4381-bb3e-4026131f86a2', '99664935-0de8-43c6-a06e-44e629fbb50d'],
  ['5c0abb19-d707-41c3-bcc4-c8dc369bfe41', '7955a0c4-c38b-4fff-92cb-8a4cd0ddf096'],
  ['69ed4a4f-f067-4a69-b0cc-082d56b358fe', '4fcbf1ea-3202-4b63-aa1f-5f30ea7079e1'],
  ['142f5962-2b00-42ae-a9e9-586b4378eaf4', '091e78bb-e552-49d4-af33-4f26a5c4fcd0'],
  ['54987dab-ab50-4427-b2db-5b78100f7db5', '091e78bb-e552-49d4-af33-4f26a5c4fcd0'],
  ['e950962d-a766-407a-b2a8-9fe00806d5ab', '19109e0a-1ded-4aeb-b6f0-2f5b93c86ebf'],
  ['bf1d3fd3-ab1a-4c9d-a1f8-8edc0d5f82d2', '81ad6c97-6038-4784-9c74-1f0b55813f60'],
  ['c5d9cb7c-f2a8-45f5-af29-2526f11c3ad9', '7955a0c4-c38b-4fff-92cb-8a4cd0ddf096'],
  // Venue-inferred links for events missing from the export snapshot:
  ['50046559-7dec-4477-8fbe-ef6fb7b7fcd9', '6dc18fc4-81a3-4457-8234-d2b551d163e1'], // 2025-september @ Novity Mauritius → Novity
  ['f063b0c1-1f38-484a-a28f-0e7dd1311cad', '8258c629-5b86-4a4a-8b5a-817a3d98b023'], // 2025-october @ PGD Mauritius → Publicis Global Delivery
  ['1df20e74-d11e-45fd-8b2b-426114ba2e84', '4fcbf1ea-3202-4b63-aa1f-5f30ea7079e1'], // 2016-july @ Extension Interactive → Extension Interactive
]

export default class extends BaseSchema {
  protected tableName = 'event_sponsors'

  async up() {
    const now = DateTime.now().toSQL({ includeOffset: false })!

    // Only keep rows whose event + sponsor actually exist to avoid FK errors
    // on partially-seeded databases.
    const eventIds = new Set(
      (await this.db.from('events').select('id')).map((r: { id: string }) => r.id)
    )
    const sponsorIds = new Set(
      (await this.db.from('sponsors').select('id')).map((r: { id: string }) => r.id)
    )

    const rows = LINKS.filter(
      ([eventId, sponsorId]) => eventIds.has(eventId) && sponsorIds.has(sponsorId)
    ).map(([eventId, sponsorId]) => ({
      event_id: eventId,
      sponsor_id: sponsorId,
      created_at: now,
    }))

    if (rows.length === 0) return

    await this.db.table(this.tableName).insert(rows).onConflict(['event_id', 'sponsor_id']).ignore()
  }

  async down() {
    // No-op. Rolling this back would orphan sponsor links added via the admin.
  }
}
