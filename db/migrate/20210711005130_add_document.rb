class AddDocument < ActiveRecord::Migration[6.1]
  def change
    create_table 'documents', force: :cascade do |t|
      t.string 'slug'
      t.string 'data'
      t.datetime 'created_at', precision: 6, null: false
      t.datetime 'updated_at', precision: 6, null: false
    end
  end
end
