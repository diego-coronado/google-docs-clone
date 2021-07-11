Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  resources :documents, only: %i[update]
  get '/documents/:slug', to: 'documents#index'
  root 'documents#index'
  mount ActionCable.server => '/cable'
end
