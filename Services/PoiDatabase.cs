using SQLite;
using MauiApp1.Models;

namespace MauiApp1.Services;

public class PoiDatabase
{
    private readonly SQLiteAsyncConnection _db;
    private bool _inited;

    public PoiDatabase()
    {
        var path = Path.Combine(FileSystem.AppDataDirectory, "pois.db");
        _db = new SQLiteAsyncConnection(path);
    }

    public async Task InitAsync()
    {
        if (_inited) return;

        await _db.CreateTableAsync<Poi>();

        try { await _db.ExecuteAsync("ALTER TABLE pois ADD COLUMN Code TEXT"); } catch { }
        try { await _db.ExecuteAsync("ALTER TABLE pois ADD COLUMN LocalizedNamesJson TEXT"); } catch { }
        try { await _db.ExecuteAsync("ALTER TABLE pois ADD COLUMN LocalizedDescriptionsJson TEXT"); } catch { }

        await _db.ExecuteAsync("CREATE UNIQUE INDEX IF NOT EXISTS IX_pois_Code ON pois(Code)");

        _inited = true;
    }

    public Task<List<Poi>> GetAllAsync()
        => _db.Table<Poi>()
              .OrderByDescending(p => p.Priority)
              .ToListAsync();

    public Task<Poi?> GetByCodeAsync(string code)
        => _db.Table<Poi>()
              .Where(p => p.Code == code)
              .FirstOrDefaultAsync();

    public Task<int> InsertAsync(Poi poi)
        => _db.InsertAsync(poi);

    public Task<int> UpdateAsync(Poi poi)
        => _db.UpdateAsync(poi);

    public Task<int> InsertManyAsync(IEnumerable<Poi> pois)
        => _db.InsertAllAsync(pois);

    public async Task UpsertAsync(Poi poi)
    {
        var existing = await GetByCodeAsync(poi.Code);

        if (existing == null)
        {
            await _db.InsertAsync(poi);
            return;
        }

        poi.Id = existing.Id;
        await _db.UpdateAsync(poi);
    }

    public async Task UpsertManyAsync(IEnumerable<Poi> pois)
    {
        foreach (var poi in pois)
        {
            await UpsertAsync(poi);
        }
    }
}